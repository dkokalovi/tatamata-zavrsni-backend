import express from "express";
import User from "../models/User.js";
import Analysis from "../models/Analysis.js";
import Interest from "../models/Interest.js";
import Company from "../models/Company.js";
import auth, { requireAdmin } from "../middleware/auth.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

router.use(auth, requireAdmin);

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  })
);

router.get(
  "/analyses",
  asyncHandler(async (req, res) => {
    const analyses = await Analysis.find()
      .populate("user", "ime prezime email")
      .populate("preporuceneFirme")
      .sort({ createdAt: -1 });
    res.json(analyses);
  })
);

router.get(
  "/interests",
  asyncHandler(async (req, res) => {
    const interests = await Interest.find()
      .populate("user", "ime prezime email")
      .populate("company")
      .populate("analysis")
      .sort({ createdAt: -1 });
    res.json(interests);
  })
);

router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const [brojKorisnika, brojAnaliza, brojFirmi, brojInteresa] = await Promise.all([
      User.countDocuments(),
      Analysis.countDocuments(),
      Company.countDocuments(),
      Interest.countDocuments(),
    ]);

    const poKategoriji = await Analysis.aggregate([
      { $group: { _id: "$kategorija", broj: { $sum: 1 } } },
      { $sort: { broj: -1 } },
    ]);

    const poStatusu = await Interest.aggregate([
      { $group: { _id: "$status", broj: { $sum: 1 } } },
    ]);

    const prosjecnaOcjena = await Interest.aggregate([
      { $match: { ocjena: { $exists: true } } },
      { $group: { _id: null, prosjek: { $avg: "$ocjena" }, broj: { $sum: 1 } } },
    ]);

    res.json({
      brojKorisnika,
      brojAnaliza,
      brojFirmi,
      brojInteresa,
      poKategoriji,
      poStatusu,
      prosjecnaOcjena: prosjecnaOcjena[0] || { prosjek: 0, broj: 0 },
    });
  })
);

export default router;