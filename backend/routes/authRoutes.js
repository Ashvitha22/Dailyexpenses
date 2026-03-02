import express from "express";
import {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp
} from "../controllers/authController.js";

const router = express.Router();

// ── Password-based (existing) ──────────────────────
router.post("/register",    registerUser);
router.post("/login",       loginUser);

// ── OTP-based (new) ────────────────────────────────
router.post("/send-otp",    sendOtp);
router.post("/verify-otp",  verifyOtp);

export default router;