import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ["Food", "Travel", "Shopping", "Bills", "Other"]
    },
    amount: {
      type: Number,
      required: true
    },
    month: {
      type: Number, // 0–11
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

// One budget per category per month per user
budgetSchema.index(
  { user: 1, category: 1, month: 1, year: 1 },
  { unique: true }
);

export default mongoose.model("Budget", budgetSchema);
