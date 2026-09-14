import { body, param } from "express-validator";

// Napomena: fotografija sama (req.file) se validira kroz multer fileFilter i
// limits u routes/analysis.js - express-validator ovdje pokriva tekstualna polja.
export const uploadAnalysisValidation = [
  body("description")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 }).withMessage("Opis je predugacak (max 500 znakova)."),
];

export const analysisIdValidation = [
  param("id").isMongoId().withMessage("Neispravan format ID-a analize."),
];
