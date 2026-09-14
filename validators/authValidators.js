import { body } from "express-validator";

export const registerValidation = [
  body("ime")
    .trim()
    .notEmpty().withMessage("Ime je obavezno.")
    .isLength({ min: 2, max: 50 }).withMessage("Ime mora imati 2-50 znakova."),
  body("prezime")
    .trim()
    .notEmpty().withMessage("Prezime je obavezno.")
    .isLength({ min: 2, max: 50 }).withMessage("Prezime mora imati 2-50 znakova."),
  body("email")
    .trim()
    .notEmpty().withMessage("Email je obavezan.")
    .isEmail().withMessage("Email nije u ispravnom formatu.")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Lozinka je obavezna.")
    .isLength({ min: 6, max: 72 }).withMessage("Lozinka mora imati barem 6 znakova."),
  body("telefon")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 30 }).withMessage("Telefon je predugacak."),
  body("adresa")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 200 }).withMessage("Adresa je predugacka."),
  body("postajeObrtnik")
    .optional()
    .isBoolean().withMessage("Neispravna vrijednost."),
  // Sljedeca polja su obavezna SAMO ako je postajeObrtnik = true
  body("companyNaziv").custom((value, { req }) => {
    if (req.body.postajeObrtnik && !value) throw new Error("Naziv obrta je obavezan.");
    return true;
  }),
  body("companyTelefon").custom((value, { req }) => {
    if (req.body.postajeObrtnik && !value) throw new Error("Telefon obrta je obavezan.");
    return true;
  }),
  body("companyKategorije").custom((value, { req }) => {
    if (req.body.postajeObrtnik && (!Array.isArray(value) || value.length === 0)) {
      throw new Error("Odaberi barem jednu kategoriju za obrt.");
    }
    return true;
  }),
];

export const loginValidation = [
  body("email").trim().notEmpty().withMessage("Email je obavezan.").isEmail().withMessage("Email nije u ispravnom formatu."),
  body("password").notEmpty().withMessage("Lozinka je obavezna."),
];