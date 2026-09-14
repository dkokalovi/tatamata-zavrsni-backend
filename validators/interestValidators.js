import { body } from "express-validator";

export const createInterestValidation = [
  body("companyId").isMongoId().withMessage("Neispravan format ID-a firme."),
  body("analysisId").isMongoId().withMessage("Neispravan format ID-a analize."),
];

export const rateInterestValidation = [
  body("ocjena").isInt({ min: 1, max: 5 }).withMessage("Ocjena mora biti broj od 1 do 5."),
  body("komentar")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Komentar je predugacak."),
];