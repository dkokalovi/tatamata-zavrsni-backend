# TataMata - Backend (API)

Backend za TataMata aplikaciju - Express API koji prima fotografiju građevinskog problema,
šalje je na AI analizu (Anthropic Claude, vision), sprema rezultat u MongoDB i preporučuje
građevinske obrte prema prepoznatoj kategoriji problema.

Frontend za ovaj backend je odvojen repozitorij: **tatamata-frontend** (Vue 3 + Vite).

## Tehnologije

- Node.js + Express
- MongoDB (Mongoose)
- JWT autentikacija (jsonwebtoken + bcryptjs)
- Multer (upload fotografija)
- express-validator (server-side validacija)
- Anthropic Claude API (AI analiza fotografije)

## Pokretanje

Potreban je Node.js (18+), MongoDB baza (najlakše besplatni MongoDB Atlas cluster) i
Anthropic API ključ.

```bash
npm install
cp .env.example .env
```

Otvori `.env` i popuni:

| Varijabla | Opis |
|---|---|
| `MONGODB_URI` | connection string tvog MongoDB Atlas clustera |
| `JWT_SECRET` | bilo koji dugačak nasumičan string |
| `ANTHROPIC_API_KEY` | ključ s console.anthropic.com |
| `CLIENT_ORIGIN` | adresa na kojoj radi frontend (npr. `http://localhost:5173`) - CORS dopušta pozive SAMO odavde |
| `PORT` | port na kojem server sluša (default 5000) |

Zatim (jednom) napuni bazu s početnim firmama i napravi admin korisnika:

```bash
node seed.js
node createAdmin.js Ana Anić admin@tatamata.hr lozinka123
```

Pokreni server:

```bash
npm run dev
```

API je dostupan na `http://localhost:<PORT>`.

## Struktura

```
├── index.js               # ulazna tocka - Express app, CORS, mongoose konekcija
├── middleware/
│   ├── auth.js             # provjera JWT tokena + requireAdmin
│   ├── asyncHandler.js      # omata async rute, hvata greske automatski
│   ├── validate.js          # cita rezultat express-validator provjera
│   └── errorHandler.js      # centralizirani error handler + 404
├── validators/              # express-validator lanci po resursu
├── models/                  # Mongoose sheme (User, Company, Analysis, Interest)
├── routes/                  # API rute (auth, analysis, companies, interest, admin, uploads)
├── services/aiAnalysis.js   # poziv Claude vision API-ja
├── seed.js                  # skripta za pocetne test-firme
└── createAdmin.js           # skripta za kreiranje admin korisnika
```

## API rute

| Ruta | Metoda | Zaštita | Namjena |
|---|---|---|---|
| `/api/auth/register` | POST | - | Registracija |
| `/api/auth/login` | POST | - | Prijava |
| `/api/auth/me` | GET | - | Provjera valjanosti tokena |
| `/api/analysis` | POST | JWT | Upload fotografije + AI analiza |
| `/api/analysis` | GET | JWT | Povijest analiza korisnika |
| `/api/analysis/:id` | GET | JWT | Detalji jedne analize (samo vlasnik) |
| `/api/companies` | GET | - | Javan popis firmi |
| `/api/companies` | POST | JWT + admin | Dodavanje firme |
| `/api/companies/:id` | DELETE | JWT + admin | Brisanje firme |
| `/api/interest` | POST | JWT | Izražavanje interesa za firmu |
| `/api/interest` | GET | JWT | Povijest interesa korisnika |
| `/api/admin/users` | GET | JWT + admin | Popis korisnika |
| `/api/admin/analyses` | GET | JWT + admin | Popis svih analiza |
| `/api/admin/interests` | GET | JWT + admin | Popis svih interesa |
| `/uploads/:filename` | GET | JWT (header ili `?token=`) | Dohvat fotografije (samo vlasnik ili admin) |

## Sigurnosne mjere

- Fotografije se serviraju kroz autoriziranu rutu, ne kao javan statički folder.
- Sva korisnički unesena polja prolaze server-side validaciju (`express-validator`).
- CORS prihvaća zahtjeve samo s adresa navedenih u `CLIENT_ORIGIN`.
- Sve async rute su omotane u `asyncHandler`, greške završavaju u jednom centraliziranom
  error handleru - server ne pada na neuhvaćenoj grešci.
- Lozinke se heširaju (bcrypt), tokeni su potpisani (JWT), admin rute imaju dvoslojnu
  provjeru (prijavljen + admin uloga).

## Napomena o bazi (MongoDB Atlas)

Ako nemaš MongoDB Atlas cluster: napravi besplatni na https://www.mongodb.com/cloud/atlas
(Free tier / M0), dodaj svoj IP u Network Access, napravi korisnika baze, i iskopiraj
connection string u `MONGODB_URI`.

## Sigurnosna napomena

`.env` datoteka se NIKAD ne commita na GitHub - već je u `.gitignore`. U repozitoriju postoji
`.env.example` s praznim predloškom.
