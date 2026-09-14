import express from "express";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import Analysis from "../models/Analysis.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

const router = express.Router();

// Slika se u <img> tagu ne moze dohvatiti sa custom Authorization headerom, pa ova
// ruta prihvaca token i kao query parametar (?token=...) - isto vrijedi i za obican
// Bearer header ako netko zove rutu programski (npr. fetch s blob odgovorom).
function getTokenFromRequest(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  if (req.query.token) return req.query.token;
  return null;
}

// GET /uploads/:filename - vraca sliku SAMO ako je korisnik prijavljen I
// (vlasnik analize na koju se slika odnosi ILI admin). Ime datoteke se dodatno
// sanitizira da se sprijeci path traversal (npr. "../../server/index.js").
router.get("/:filename", async (req, res) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ message: "Niste prijavljeni." });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Nevazeci token." });
  }

  const filename = path.basename(req.params.filename); // sprjecava path traversal
  const filePath = path.join(UPLOAD_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Slika ne postoji." });
  }

  // Admin smije vidjeti sve slike (potrebno za admin panel); obican korisnik
  // smije vidjeti samo sliku vezanu uz vlastitu analizu.
  if (decoded.role !== "admin") {
    const analysis = await Analysis.findOne({ slika: `/uploads/${filename}` });
    if (!analysis || analysis.user.toString() !== decoded.id) {
      return res.status(403).json({ message: "Nemate pristup ovoj slici." });
    }
  }

  res.sendFile(filePath);
});

export default router;
