import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/Company.js";
import auth from "../middleware/auth.js";
import asyncHandler from "../middleware/asyncHandler.js";
import validate from "../middleware/validate.js";
import { registerValidation, loginValidation } from "../validators/authValidators.js";
import { updateProfileValidation, changePasswordValidation } from "../validators/profileValidators.js";

const router = express.Router();

function makeToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(user) {
  return {
    id: user._id,
    ime: user.ime,
    prezime: user.prezime,
    email: user.email,
    telefon: user.telefon,
    adresa: user.adresa,
    role: user.role,
  };
}

router.post(
  "/register",
  registerValidation,
  validate,
  asyncHandler(async (req, res) => {
    const {
      ime, prezime, email, password, telefon, adresa,
      postajeObrtnik, companyNaziv, companyTelefon, companyGrad, companyKategorije,
    } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email je vec registriran." });
    }

    const hashed = await bcrypt.hash(password, 10);
    // Uloga "admin" se ne moze postaviti kroz registraciju. "contractor" MOZE, jer
    // ne nosi nikakve dodatne ovlasti u sustavu (isti pristup kao "client") - samo
    // oznacava da korisnik uz sebe ima i vlastiti Company zapis.
    const role = postajeObrtnik ? "contractor" : "client";
    const user = await User.create({
      ime, prezime, email, telefon, adresa,
      password: hashed,
      role,
    });

    if (postajeObrtnik) {
      await Company.create({
        naziv: companyNaziv,
        telefon: companyTelefon,
        email,
        grad: companyGrad || "",
        kategorije: companyKategorije,
        vlasnik: user._id,
      });
    }

    res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  })
);

router.post(
  "/login",
  loginValidation,
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Neispravni podaci za prijavu." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Neispravni podaci za prijavu." });
    }

    res.json({ token: makeToken(user), user: publicUser(user) });
  })
);

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.json({ user: null });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      res.json({ user: user ? publicUser(user) : null });
    } catch {
      res.json({ user: null });
    }
  })
);

router.patch(
  "/me",
  auth,
  updateProfileValidation,
  validate,
  asyncHandler(async (req, res) => {
    const { ime, prezime, telefon, adresa } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { ime, prezime, telefon, adresa },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "Korisnik ne postoji." });
    res.json({ user: publicUser(user) });
  })
);

router.patch(
  "/me/lozinka",
  auth,
  changePasswordValidation,
  validate,
  asyncHandler(async (req, res) => {
    const { trenutnaLozinka, novaLozinka } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Korisnik ne postoji." });

    const match = await bcrypt.compare(trenutnaLozinka, user.password);
    if (!match) {
      return res.status(400).json({ message: "Trenutna lozinka nije ispravna." });
    }

    user.password = await bcrypt.hash(novaLozinka, 10);
    await user.save();

    res.json({ message: "Lozinka je uspjesno promijenjena." });
  })
);

export default router;