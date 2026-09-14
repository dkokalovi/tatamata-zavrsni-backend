import express from "express";
import Interest from "../models/Interest.js";
import Analysis from "../models/Analysis.js";
import auth, { requireAdmin } from "../middleware/auth.js";
import asyncHandler from "../middleware/asyncHandler.js";
import validate from "../middleware/validate.js";
import { createInterestValidation } from "../validators/interestValidators.js";

const router = express.Router();

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

router.patch(
  "/:id",
  auth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const DOZVOLJENI_STATUSI = ["na_cekanju", "kontaktirano", "zavrseno"];
    if (!DOZVOLJENI_STATUSI.includes(status)) {
      return res.status(400).json({ message: "Neispravan status." });
    }

    const interest = await Interest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!interest) return res.status(404).json({ message: "Interes ne postoji." });

    res.json(interest);
  })
);

export default router;