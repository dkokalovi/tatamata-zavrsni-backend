import express from "express";
import User from "../models/User.js";
import Analysis from "../models/Analysis.js";
import Interest from "../models/Interest.js";
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

export default router;
