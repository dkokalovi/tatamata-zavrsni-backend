import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import analysisRoutes from "./routes/analysis.js";
import companyRoutes from "./routes/companies.js";
import interestRoutes from "./routes/interest.js";
import adminRoutes from "./routes/admin.js";
import uploadsRoutes from "./routes/uploads.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// CORS: dopusteno je samo frontendu s adrese CLIENT_ORIGIN (ili nekoliko adresa
// odvojenih zarezom, npr. za razvoj + produkciju istovremeno) da zove ovaj API -
// ne bilo koja stranica na internetu.
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin(origin, callback) {
      // origin je undefined za pozive bez browsera (npr. Postman, curl, mobilne app) -
      // to se svjesno dopusta jer ionako svaka zasticena ruta trazi JWT.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("CORS: ova domena nije dopustena."));
    },
  })
);

app.use(express.json());

// Fotografije se VISE NE serviraju kao obican staticki folder (express.static) -
// svaka od njih prolazi kroz autorizacijsku provjeru u routes/uploads.js.
app.use("/uploads", uploadsRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/interest", interestRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => res.json({ status: "TataMata API radi" }));

// Mora ici NAKON svih ruta: prvo 404 za nepostojece rute, pa centralizirani
// error handler za sve greske proslijedene kroz next(err) (npr. iz asyncHandler-a).
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("UPOZORENJE: ANTHROPIC_API_KEY nije postavljen u .env - AI analiza nece raditi.");
}
if (!process.env.JWT_SECRET) {
  console.warn("UPOZORENJE: JWT_SECRET nije postavljen u .env - autentikacija nece raditi sigurno.");
}

// Dodatni listeneri (ne samo initial .connect().catch()) - hvataju probleme koji
// se dogode NAKON sto je konekcija vec uspostavljena (npr. Atlas privremeno padne),
// da se to barem vidi u logovima umjesto da se pojavi kao nejasna greska na ruti.
mongoose.connection.on("error", (err) => {
  console.error("Mongo konekcija - greska:", err.message);
});
mongoose.connection.on("disconnected", () => {
  console.warn("Mongo konekcija je prekinuta - Mongoose ce pokusati ponovno spajanje.");
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Povezano na MongoDB");
    app.listen(PORT, () => console.log(`Server slusa na portu ${PORT}`));
  })
  .catch((err) => {
    console.error("Greska pri spajanju na MongoDB:", err.message);
    process.exit(1);
  });
