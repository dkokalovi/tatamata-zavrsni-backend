import { body } from "express-validator";

export const createInterestValidation = [
  body("companyId").isMongoId().withMessage("Neispravan format ID-a firme."),
  body("analysisId").isMongoId().withMessage("Neispravan format ID-a analize."),
];
