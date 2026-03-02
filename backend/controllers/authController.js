import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

/* ============================================================
   Email Transporter
============================================================ */
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email credentials not found in environment variables");
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/* ============================================================
   Helpers
============================================================ */
const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });

/* ============================================================
   Send OTP Email
============================================================ */
const sendOtpEmail = async (email, otp, purpose) => {
  const transporter = createTransporter();
  const isSignup = purpose === "signup";

  await transporter.sendMail({
    from: `"DailyExpense" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: isSignup
      ? "Verify your DailyExpense account"
      : "Your DailyExpense Login OTP",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;
                  padding:32px;background:#0A0A0F;color:#F0EBE1;border-radius:16px;">
        <h2 style="color:#F0EBE1;">
          ${isSignup ? "Verify your account" : "Login OTP"}
        </h2>
        <p style="color:#9B9AAF;">
          Use the code below to ${isSignup ? "verify your account" : "sign in"}.
          This code expires in <strong>10 minutes</strong>.
        </p>
        <div style="background:#16161F;padding:24px;text-align:center;
                    font-size:2.5rem;font-weight:bold;color:#5EEAD4;
                    letter-spacing:0.4em;">
          ${otp}
        </div>
        <p style="color:#52526A;font-size:12px;margin-top:20px;">
          If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
};

/* ============================================================
   1. REGISTER (Password Based)
============================================================ */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });

    if (existing) {
      // ── FIX 2: OTP-registered user setting a password for the first time ──
      if (existing.isVerified && !existing.password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        existing.password = hashedPassword;
        await existing.save();
        return res.status(200).json({ message: "Password set successfully. You can now log in." });
      }
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: true, // password signup = auto verified
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================================================
   2. LOGIN (Password Based)
============================================================ */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    // ── FIX 2: Allow OTP users to log in with password if they've set one ──
    if (!user.password)
      return res.status(401).json({
        message: "This account has no password set. Please sign in with OTP, or go to Register to set a password.",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // ── FIX 1: Always return isVerified from DB, never stale ──
    const token = signToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified, // ← include this
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================================================
   3. SEND OTP
============================================================ */
export const sendOtp = async (req, res) => {
  try {
    const { email, purpose = "login", name } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    let user = await User.findOne({ email });

    if (purpose === "signup") {
      if (user && user.isVerified)
        return res.status(400).json({
          message: "Email already registered. Please log in instead.",
        });

      if (!name)
        return res.status(400).json({ message: "Name is required for signup" });

      // Re-use unverified user record if it exists, else create new
      if (!user) {
        user = await User.create({
          name,
          email,
          password: "",
          isVerified: false,
        });
      } else {
        // Update name in case they're retrying signup
        user.name = name;
      }
    } else {
      if (!user)
        return res.status(404).json({
          message: "No account found with this email. Please sign up first.",
        });
    }

    const otp = generateOtp();
    const otpHashed = await bcrypt.hash(otp, 8);

    user.otp = otpHashed;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(email, otp, purpose);

    res.json({ message: `OTP sent to ${email}` });
  } catch (error) {
    console.error("sendOtp error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ============================================================
   4. VERIFY OTP
============================================================ */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose = "login" } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });

    if (!user || !user.otp || !user.otpExpiry)
      return res.status(400).json({
        message: "No OTP found for this email. Please request a new one.",
      });

    if (new Date() > user.otpExpiry) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
      });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid OTP. Please try again." });

    user.otp = null;
    user.otpExpiry = null;
    user.isVerified = true; // ── FIX 1: always mark verified on successful OTP
    await user.save();

    const token = signToken(user._id);

    res.json({
      message: purpose === "signup" ? "Account created and verified!" : "Login successful!",
      token,
      // ── FIX 1: always return isVerified: true in response ──
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    res.status(500).json({ message: error.message });
  }
};