import mongoose from "mongoose";

// Fiksni popis kategorija problema - AI analiza vraca jednu od ovih kategorija,
// a firme se oglasavaju za jednu ili vise kategorija u kojima rade.
export const KATEGORIJE = [
  "vlaga_i_fleke",
  "pukotine",
  "krov",
  "vodoinstalacije",
  "elektroinstalacije",
  "fasada",
  "podovi_i_zidne_obloge",
  "izolacija",
  "plijesan",
  "stolarija",
  "ostalo",
];

const companySchema = new mongoose.Schema(
  {
    naziv: { type: String, required: true, trim: true },
    telefon: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    grad: { type: String, trim: true },
    opis: { type: String, trim: true },
    kategorije: {
      type: [String],
      enum: KATEGORIJE,
      required: true,
      validate: (arr) => arr.length > 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);
