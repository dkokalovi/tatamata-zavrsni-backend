import { validationResult } from "express-validator";

// Stavlja se NAKON niza express-validator provjera na ruti. Ako je bilo koja
// provjera pala, vraca 400 s popisom svih gresaka umjesto da ruta uopce krene
// izvrsavati poslovnu logiku.
export default function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Neispravni podaci u zahtjevu.",
      errors: errors.array().map((e) => ({ polje: e.path, poruka: e.msg })),
    });
  }
  next();
}
