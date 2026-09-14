import { body } from "express-validator";

export const updateProfileValidation = [
  body("ime").trim().notEmpty().isLength({ min: 2, max: 50 }).withMessage("Ime mora imati 2-50 znakova."),
  body("prezime").trim().notEmpty().isLength({ min: 2, max: 50 }).withMessage("Prezime mora imati 2-50 znakova."),
  body("telefon").optional({ values: "falsy" }).trim().isLength({ max: 30 }).withMessage("Telefon je predugacak."),
  body("adresa").optional({ values: "falsy" }).trim().isLength({ max: 200 }).withMessage("Adresa je predugacka."),
];

export const changePasswordValidation = [
  body("trenutnaLozinka").notEmpty().withMessage("Trenutna lozinka je obavezna."),
  body("novaLozinka").isLength({ min: 6, max: 72 }).withMessage("Nova lozinka mora imati barem 6 znakova."),
];