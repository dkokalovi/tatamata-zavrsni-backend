import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    slika: { type: String, required: true }, // putanja do uploadane slike, npr /uploads/xyz.jpg
    opisKorisnika: { type: String, default: "", trim: true },

    // Rezultat AI analize
    naslovProblema: { type: String, required: true },
    kategorija: { type: String, required: true },
    opisProblema: { type: String, required: true },
    preporuceno_rjesenje: { type: String, required: true },
    hitnost: { type: String, enum: ["niska", "srednja", "visoka"], default: "srednja" },
    procjenaTroskaMin: { type: Number },
    procjenaTroskaMax: { type: Number },
    pouzdanost: { type: Number, min: 0, max: 1 }, // koliko je AI siguran u dijagnozu (0-1)

    preporuceneFirme: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],
  },
  { timestamps: true }
);

export default mongoose.model("Analysis", analysisSchema);
