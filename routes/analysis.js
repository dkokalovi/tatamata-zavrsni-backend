import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Analysis from "../models/Analysis.js";
import Company from "../models/Company.js";
import auth from "../middleware/auth.js";
import asyncHandler from "../middleware/asyncHandler.js";
import validate from "../middleware/validate.js";
import { uploadAnalysisValidation, analysisIdValidation } from "../validators/analysisValidators.js";
import { analyzePhoto } from "../services/aiAnalysis.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Dozvoljene su samo slike."));
    }
    cb(null, true);
  },
});

const router = express.Router();

// Upload fotografije + AI analiza + preporuka firmi, sve u jednom pozivu.
router.post(
  "/",
  auth,
  upload.single("photo"),
  uploadAnalysisValidation,
  validate,
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Fotografija je obavezna." });
    }

    let aiResult;
    try {
      const imageBuffer = fs.readFileSync(req.file.path);
      aiResult = await analyzePhoto(imageBuffer, req.file.originalname, req.body.description);
    } catch (err) {
      console.error("Greska pri AI analizi:", err.message);
      return res.status(502).json({ message: "AI servis trenutno nije dostupan. Pokusaj ponovno." });
    }

    // Pronadi do 3 firme koje rade u prepoznatoj kategoriji problema
    let companies = await Company.find({ kategorije: aiResult.kategorija }).limit(3);
    if (companies.length === 0) {
      companies = await Company.find({ kategorije: "ostalo" }).limit(3);
    }

    const analysis = await Analysis.create({
      user: req.userId,
      slika: `/uploads/${req.file.filename}`,
      opisKorisnika: req.body.description || "",
      naslovProblema: aiResult.naslovProblema,
      kategorija: aiResult.kategorija,
      opisProblema: aiResult.opisProblema,
      preporuceno_rjesenje: aiResult.preporuceno_rjesenje,
      hitnost: aiResult.hitnost,
      procjenaTroskaMin: aiResult.procjenaTroskaMin,
      procjenaTroskaMax: aiResult.procjenaTroskaMax,
      pouzdanost: aiResult.pouzdanost,
      preporuceneFirme: companies.map((c) => c._id),
    });

    const populated = await analysis.populate("preporuceneFirme");
    res.status(201).json(populated);
  })
);

// Povijest analiza prijavljenog korisnika (najnovije prve)
router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const analyses = await Analysis.find({ user: req.userId })
      .populate("preporuceneFirme")
      .sort({ createdAt: -1 });
    res.json(analyses);
  })
);

router.get(
  "/:id",
  auth,
  analysisIdValidation,
  validate,
  asyncHandler(async (req, res) => {
    const analysis = await Analysis.findById(req.params.id).populate("preporuceneFirme");
    if (!analysis) return res.status(404).json({ message: "Analiza ne postoji." });
    if (analysis.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Nemate pristup ovoj analizi." });
    }
    res.json(analysis);
  })
);

export default router;
