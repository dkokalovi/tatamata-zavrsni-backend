import { body, param } from "express-validator";
import { KATEGORIJE } from "../models/Company.js";

export const createCompanyValidation = [
  body("naziv")
    .trim()
    .notEmpty().withMessage("Naziv je obavezan.")
    .isLength({ min: 2, max: 100 }).withMessage("Naziv mora imati 2-100 znakova."),
  body("telefon")
    .trim()
    .notEmpty().withMessage("Telefon je obavezan.")
    .isLength({ min: 5, max: 30 }).withMessage("Telefon mora imati 5-30 znakova."),
  body("email")
    .trim()
    .notEmpty().withMessage("Email je obavezan.")
    .isEmail().withMessage("Email nije u ispravnom formatu.")
    .normalizeEmail(),
  body("grad")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 100 }).withMessage("Naziv grada je predugacak."),
  body("opis")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 }).withMessage("Opis je predugacak (max 500 znakova)."),
  body("kategorije")
    .isArray({ min: 1 }).withMessage("Potrebna je barem jedna kategorija.")
    .custom((arr) => arr.every((k) => KATEGORIJE.includes(k)))
    .withMessage(`Kategorije moraju biti iz dozvoljenog popisa: ${KATEGORIJE.join(", ")}.`),
];

export const companyIdValidation = [
  param("id").isMongoId().withMessage("Neispravan format ID-a firme."),
];
