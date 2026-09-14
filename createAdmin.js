// Kreira admin korisnika (ili promovira postojeceg u admina) za potrebe testiranja.
// Pokreni:  node createAdmin.js ime prezime email lozinka
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

const [, , ime, prezime, email, password] = process.argv;

if (!ime || !prezime || !email || !password) {
  console.log("Upotreba: node createAdmin.js <ime> <prezime> <email> <lozinka>");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      user.role = "admin";
      await user.save();
      console.log(`Postojeci korisnik ${email} je sada admin.`);
    } else {
      const hashed = await bcrypt.hash(password, 10);
      user = await User.create({ ime, prezime, email, password: hashed, role: "admin" });
      console.log(`Kreiran novi admin korisnik: ${email}`);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error("Greska:", err.message);
    process.exit(1);
  });
