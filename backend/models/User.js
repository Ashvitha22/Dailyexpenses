import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      default: ""   // empty for OTP-only users
    },

    // ── OTP fields ──────────────────────────────
    otp: {
      type: String,
      default: null
    },

    otpExpiry: {
      type: Date,
      default: null
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    // ── Profile fields (existing) ────────────────
    age: { type: Number },
    dateOfBirth: { type: Date },
    city: { type: String },
    country: { type: String },
    nationality: { type: String },
    phone: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);