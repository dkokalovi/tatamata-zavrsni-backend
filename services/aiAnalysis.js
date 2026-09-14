import Anthropic from "@anthropic-ai/sdk";
import { KATEGORIJE } from "../models/Company.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Model koji podrzava analizu slika (vision). Haiku je jeftiniji ako trosis
// puno poziva tijekom razvoja/testiranja, Sonnet daje kvalitetnije odgovore.
const MODEL = "claude-sonnet-5";

function mimeTypeFor(originalname) {
  const ext = originalname.split(".").pop().toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "image/jpeg";
}

const SYSTEM_PROMPT = `Ti si strucni gradevinski procjenitelj koji analizira fotografije problema u
kuci ili stanu (vlaga, pukotine, ostecenja krova, instalacija, plijesan i slicno) za hrvatsko
trziste. Korisnik salje fotografiju problema i (opcionalno) kratak opis. Tvoj zadatak je:

1. Utvrditi o kojem se gradevinskom problemu radi na temelju SLIKE (opis je samo dodatni kontekst,
   ne oslanjaj se samo na njega).
2. Objasniti korisniku razumljivim jezikom sto je uzrok problema.
3. Predloziti konkretno rjesenje.
4. Procijeniti grubi raspon troska popravka u eurima za hrvatsko trziste.
5. Odrediti hitnost problema.
6. Svrstati problem u TOCNO JEDNU od sljedecih kategorija (koristi tocno ove nazive, bez izmjena):
${KATEGORIJE.join(", ")}

Ako fotografija ne prikazuje jasan gradevinski problem ili je nejasna, budi iskren o tome u polju
"opisProblema" i postavi "pouzdanost" na nisku vrijednost (npr. 0.2-0.4), ali svejedno popuni sva
polja najboljom procjenom.

VAZNO: Odgovori ISKLJUCIVO validnim JSON objektom, bez ikakvog dodatnog teksta, bez markdown
code fenceova, tocno u ovom obliku:
{
  "naslovProblema": "kratak naziv problema (par rijeci)",
  "kategorija": "jedna od navedenih kategorija",
  "opisProblema": "2-4 recenice - sto se vidi na slici i koji je vjerojatni uzrok",
  "preporuceno_rjesenje": "2-4 recenice - konkretni koraci rjesenja",
  "hitnost": "niska" | "srednja" | "visoka",
  "procjenaTroskaMin": broj (EUR),
  "procjenaTroskaMax": broj (EUR),
  "pouzdanost": broj izmedu 0 i 1
}`;

function extractJson(text) {
  // Claude bi trebao vratiti cisti JSON, ali za svaki slucaj izvucemo prvi { ... } blok
  // ako je model ipak dodao neki tekst oko njega.
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI odgovor ne sadrzi JSON.");
  return JSON.parse(match[0]);
}

/**
 * Analizira fotografiju gradevinskog problema pomocu Claude vision API-ja.
 * @param {Buffer} imageBuffer - sadrzaj slike
 * @param {string} originalname - originalni naziv datoteke (za odredivanje mime tipa)
 * @param {string} description - opcionalni tekstualni opis korisnika
 */
export async function analyzePhoto(imageBuffer, originalname, description) {
  const base64Image = imageBuffer.toString("base64");
  const mediaType = mimeTypeFor(originalname);

  const userText = description && description.trim()
    ? `Dodatni opis korisnika: "${description.trim()}"`
    : "Korisnik nije dodao tekstualni opis - oslanjaj se iskljucivo na fotografiju.";

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64Image },
          },
          { type: "text", text: userText },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("AI nije vratio tekstualni odgovor.");

  const parsed = extractJson(textBlock.text);

  // Sigurnosna provjera da kategorija bude iz dozvoljenog popisa
  if (!KATEGORIJE.includes(parsed.kategorija)) {
    parsed.kategorija = "ostalo";
  }

  return parsed;
}
