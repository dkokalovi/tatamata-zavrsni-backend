import express from "express";
import Company from "../models/Company.js";
import auth, { requireAdmin } from "../middleware/auth.js";
import asyncHandler from "../middleware/asyncHandler.js";
import validate from "../middleware/validate.js";
import { createCompanyValidation, companyIdValidation } from "../validators/companyValidators.js";

const router = express.Router();

// Javan popis firmi, s brojem izrazenih interesa po firmi (za admin prikaz).
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const companies = await Company.aggregate([
      { $sort: { naziv: 1 } },
      {
        $lookup: {
          from: "interests",
          localField: "_id",
          foreignField: "company",
          as: "interesi",
        },
      },
      { $addFields: { brojInteresa: { $size: "$interesi" } } },
      { $project: { interesi: 0 } },
    ]);
    res.json(companies);
  })
);

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