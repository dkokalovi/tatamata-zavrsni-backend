import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";
import validate from "../middleware/validate.js";
import { registerValidation, loginValidation } from "../validators/authValidators.js";

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
    const { ime, prezime, email, password, telefon, adresa } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email je vec registriran." });
    }

    const hashed = await bcrypt.hash(password, 10);
    // Rola "admin" se namjerno ne moze postaviti kroz javnu registraciju -
    // admin korisnike postavlja se rucno u bazi.
    const user = await User.create({
      ime,
      prezime,
      email,
      telefon,
      adresa,
      password: hashed,
      role: "client",
    });

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
    // koristi se od strane frontenda da provjeri je li token jos validan
    // (posebna ruta, ne treba middleware jer namjerno vraca user:null bez greske)
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

export default router;
