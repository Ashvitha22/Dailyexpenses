import api from "./api";

// ── Password-based ─────────────────────────────────
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser    = (data) => api.post("/auth/login",    data);

// ── OTP-based ──────────────────────────────────────

/**
 * Send OTP to email
 * @param {string} email
 * @param {"login"|"signup"} purpose
 * @param {string} [name]  — only needed for purpose="signup"
 */
export const sendOtp = (email, purpose, name) =>
  api.post("/auth/send-otp", {
    email,
    purpose,
    ...(name ? { name } : {})
  });

/**
 * Verify OTP — returns { token, user }
 * @param {string} email
 * @param {string} otp    — 6-digit string
 * @param {"login"|"signup"} purpose
 */
export const verifyOtp = (email, otp, purpose) =>
  api.post("/auth/verify-otp", { email, otp, purpose });