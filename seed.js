// Pokreni jednom da napunis bazu s pocetnim firmama za testiranje:
//   node seed.js
import "dotenv/config";
import mongoose from "mongoose";
import Company from "./models/Company.js";

const companies = [
  {
    naziv: "ProBuild d.o.o.",
    telefon: "+385 91 234 5678",
    email: "kontakt@probuild.hr",
    grad: "Zagreb",
    opis: "Sanacija vlage, krovopokrivacki radovi.",
    kategorije: ["vlaga_i_fleke", "krov", "izolacija"],
  },
  {
    naziv: "FixIt Sve d.o.o.",
    telefon: "+385 98 765 4321",
    email: "info@fixitsve.hr",
    grad: "Split",
    opis: "Sitni gradevinski radovi, gletanje i sanacija pukotina.",
    kategorije: ["pukotine", "podovi_i_zidne_obloge"],
  },
  {
    naziv: "AquaServis obrt",
    telefon: "+385 95 111 2222",
    email: "aquaservis@gmail.com",
    grad: "Rijeka",
    opis: "Vodoinstalaterski radovi, hitne intervencije.",
    kategorije: ["vodoinstalacije", "vlaga_i_fleke"],
  },
  {
    naziv: "Elektro Maras",
    telefon: "+385 92 333 4444",
    email: "elektro.maras@outlook.com",
    grad: "Osijek",
    opis: "Elektroinstalaterski radovi i popravci.",
    kategorije: ["elektroinstalacije"],
  },
  {
    naziv: "CistiZid obrt za plijesan",
    telefon: "+385 99 555 6666",
    email: "cistizid@gmail.com",
    grad: "Zagreb",
    opis: "Specijalizirani za uklanjanje plijesni i sanaciju vlage.",
    kategorije: ["plijesan", "vlaga_i_fleke"],
  },
  {
    naziv: "Fasada Plus",
    telefon: "+385 91 777 8888",
    email: "info@fasadaplus.hr",
    grad: "Zadar",
    opis: "Fasaderski radovi i vanjska izolacija.",
    kategorije: ["fasada", "izolacija"],
  },
  {
    naziv: "Univerzalni Majstor obrt",
    telefon: "+385 98 999 0000",
    email: "univerzalnimajstor@gmail.com",
    grad: "Varazdin",
    opis: "Razni manji kucanski i gradevinski popravci.",
    kategorije: ["ostalo", "stolarija"],
  },
];

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    await Company.deleteMany({});
    await Company.insertMany(companies);
    console.log(`Ubaceno ${companies.length} firmi.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Greska:", err.message);
    process.exit(1);
  });
