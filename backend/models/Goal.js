import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name:     { type: String, required: true, trim: true },
    target:   { type: Number, required: true, min: 1 },
    saved:    { type: Number, default: 0, min: 0 },
    deadline: { type: Date },
    icon:     { type: String, default: "🎯" },
    color:    { type: String, default: "#5EEAD4" },
    note:     { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Goal", goalSchema);