import mongoose from "mongoose";

const interestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    analysis: { type: mongoose.Schema.Types.ObjectId, ref: "Analysis", required: true },
    status: { type: String, enum: ["na_cekanju", "kontaktirano", "zavrseno"], default: "na_cekanju" },
  },
  { timestamps: true }
);

export default mongoose.model("Interest", interestSchema);
