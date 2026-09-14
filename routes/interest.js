import express from "express";
import Interest from "../models/Interest.js";
import Analysis from "../models/Analysis.js";
import auth from "../middleware/auth.js";
import asyncHandler from "../middleware/asyncHandler.js";
import validate from "../middleware/validate.js";
import { createInterestValidation } from "../validators/interestValidators.js";

const router = express.Router();

// Korisnik oznacava da ga zanima kontakt s odredenom preporucenom firmom
router.post(
  "/",
  auth,
  createInterestValidation,
  validate,
  asyncHandler(async (req, res) => {
    const { companyId, analysisId } = req.body;

    const analysis = await Analysis.findById(analysisId);
    if (!analysis) return res.status(404).json({ message: "Analiza ne postoji." });
    if (analysis.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Ova analiza ne pripada vama." });
    }

    const interest = await Interest.create({
      user: req.userId,
      company: companyId,
      analysis: analysisId,
    });

    res.status(201).json(interest);
  })
);

// Povijest interesa prijavljenog korisnika
router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const interests = await Interest.find({ user: req.userId })
      .populate("company")
      .populate("analysis")
      .sort({ createdAt: -1 });
    res.json(interests);
  })
);

export default router;
