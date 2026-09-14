import express from "express";
import Company from "../models/Company.js";
import auth, { requireAdmin } from "../middleware/auth.js";
import asyncHandler from "../middleware/asyncHandler.js";
import validate from "../middleware/validate.js";
import { createCompanyValidation, companyIdValidation } from "../validators/companyValidators.js";

const router = express.Router();

// Javan popis firmi (npr. za pregled u aplikaciji)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const companies = await Company.find().sort({ naziv: 1 });
    res.json(companies);
  })
);

// Dodavanje firme - samo admin (za sada; kontraktori se ne registriraju sami,
// to je namjerno pojednostavljeno za potrebe ovog projekta)
router.post(
  "/",
  auth,
  requireAdmin,
  createCompanyValidation,
  validate,
  asyncHandler(async (req, res) => {
    const { naziv, telefon, email, grad, opis, kategorije } = req.body;
    const company = await Company.create({ naziv, telefon, email, grad, opis, kategorije });
    res.status(201).json(company);
  })
);

router.delete(
  "/:id",
  auth,
  requireAdmin,
  companyIdValidation,
  validate,
  asyncHandler(async (req, res) => {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: "Firma ne postoji." });
    res.json({ message: "Firma obrisana." });
  })
);

export default router;
