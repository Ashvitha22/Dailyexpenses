import mongoose from "mongoose";

const netWorthItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label:    { type: String, required: true, trim: true },
    amount:   { type: Number, required: true, min: 0 },
    type:     { type: String, required: true, enum: ["asset", "liability"] },
    category: { type: String, required: true },
    note:     { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("NetWorthItem", netWorthItemSchema);