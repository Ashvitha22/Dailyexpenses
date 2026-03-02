import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label:     { type: String, required: true, trim: true },
    amount:    { type: Number, required: true, min: 0 },
    category:  { type: String, required: true, enum: ["salary","freelance","business","investment","rental","gift","other"] },
    frequency: { type: String, default: "monthly", enum: ["one-time","daily","weekly","monthly","yearly"] },
    date:      { type: Date, default: Date.now },
    note:      { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Income", incomeSchema);