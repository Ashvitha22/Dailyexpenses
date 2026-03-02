import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { loginUser, sendOtp, verifyOtp } from "../services/authService";

const baseInp = {
  fontFamily: "var(--sans)", fontSize: 14, fontWeight: 300,
  color: "var(--text)", background: "rgba(255,255,255,0.03)",
  border: "1px solid var(--bdr)", borderRadius: "var(--r-md)",
  padding: "12px 14px", outline: "none", width: "100%",
  transition: "border-color .2s, box-shadow .2s",
};
const onFocus = e => { e.target.style.borderColor = "var(--accent-bdr)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-bg)"; };
const onBlur  = e => { e.target.style.borderColor = "var(--bdr)";        e.target.style.boxShadow = "none"; };

const N = 6;

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab]             = useState("password");
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  // password
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [pwLoading, setPwLoad]    = useState(false);

  // otp
  const [otpEmail, setOtpEmail]   = useState("");
  const [otpCode, setOtpCode]     = useState("");
  const [otpSent, setOtpSent]     = useState(false);
  const [otpLoading, setOtpLoad]  = useState(false);
  const [timer, setTimer]         = useState(0);

  const clear = () => { setError(""); setSuccess(""); };

  const startTimer = () => {
    setTimer(60);
    const id = setInterval(() =>
      setTimer(t => { if (t <= 1) { clearInterval(id); return 0; } return t - 1; }), 1000);
  };

  const handlePwLogin = async e => {
    e.preventDefault(); clear();
    try {
      setPwLoad(true);
      const res = await loginUser({ email, password });
      localStorage.setItem("token", res.data.token);
      if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally { setPwLoad(false); }
  };

  const handleSend = async () => {
    clear();
    if (!otpEmail.trim()) { setError("Please enter your email."); return; }
    try {
      setOtpLoad(true);
      await sendOtp(otpEmail, "login");
      setOtpSent(true);
      setSuccess(`OTP sent to ${otpEmail} — check your inbox.`);
      startTimer();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally { setOtpLoad(false); }
  };

  const handleVerify = async e => {
    e.preventDefault(); clear();
    if (otpCode.length !== N) { setError("Please enter all 6 digits."); return; }
    try {
      setOtpLoad(true);
      const res = await verifyOtp(otpEmail, otpCode, "login");
      localStorage.setItem("token", res.data.token);
      if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally { setOtpLoad(false); }
  };

  const handleResend = async () => {
    clear();
    try {
      setOtpLoad(true);
      await sendOtp(otpEmail, "login");
      setOtpCode(""); setSuccess("New OTP sent!"); startTimer();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend.");
    } finally { setOtpLoad(false); }
  };

  const handleDigit = (i, val) => {
    const d = val.replace(/\D/g, "");
    const a = otpCode.split(""); a[i] = d;
    const joined = a.join("").slice(0, N);
    setOtpCode(joined);
    if (d && i < N - 1) document.getElementById(`lg-${i + 1}`)?.focus();
  };

  const tabBtn = (id, icon, label) => (
    <button key={id}
      onClick={() => { setTab(id); clear(); setOtpSent(false); setOtpCode(""); }}
      style={{
        fontFamily: "var(--sans)", fontSize: 13, fontWeight: tab === id ? 600 : 400,
        padding: "9px 0", borderRadius: "var(--r-sm)", border: "none", cursor: "pointer",
        background: tab === id ? "var(--accent)" : "transparent",
        color: tab === id ? "#0A0A0F" : "var(--text-3)",
        transition: "all .2s",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
      {icon} {label}
    </button>
  );

  return (
    <Layout>
      <div style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Header */}
          <div className="anim-1" style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "var(--accent-bg)", border: "1px solid var(--accent-bdr)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, margin: "0 auto 16px",
            }}>💳</div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.9rem", fontWeight: 400, color: "var(--text)", marginBottom: 6 }}>
              Welcome back
            </h1>
            <p style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 300, color: "var(--text-2)" }}>
              Sign in to your account
            </p>
          </div>

          {/* Card */}
          <div className="card anim-2">

            {/* Tab switcher */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4,
              background: "rgba(255,255,255,0.03)", border: "1px solid var(--bdr)",
              borderRadius: "var(--r-md)", padding: 4, marginBottom: 24,
            }}>
              {tabBtn("password", "🔑", "Password")}
              {tabBtn("otp", "📧", "OTP Email")}
            </div>

            {/* Banners */}
            {error   && <div style={{ padding: "11px 14px", borderRadius: "var(--r-md)", marginBottom: 16, background: "var(--err-bg)", border: "1px solid rgba(248,113,113,.3)", color: "var(--err)", fontFamily: "var(--sans)", fontSize: 13, lineHeight: 1.5 }}>{error}</div>}
            {success && <div style={{ padding: "11px 14px", borderRadius: "var(--r-md)", marginBottom: 16, background: "var(--ok-bg)",  border: "1px solid rgba(74,222,128,.3)",  color: "var(--ok)",  fontFamily: "var(--sans)", fontSize: 13, lineHeight: 1.5 }}>{success}</div>}

            {/* ── PASSWORD TAB ── */}
            {tab === "password" && (
              <form onSubmit={handlePwLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <label className="label">Email Address</label>
                  <input style={baseInp} type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={onFocus} onBlur={onBlur} required />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <label className="label">Password</label>
                  <input style={baseInp} type="password" placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={onFocus} onBlur={onBlur} required />
                </div>
                <button type="submit" className="btn-primary" disabled={pwLoading}
                  style={{ width: "100%", padding: 13, fontSize: 14, marginTop: 4 }}>
                  {pwLoading ? "Signing in…" : "Sign In"}
                </button>
              </form>
            )}

            {/* ── OTP TAB ── */}
            {tab === "otp" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Email + send */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <label className="label">Email Address</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      style={{ ...baseInp, flex: 1 }}
                      type="email" placeholder="you@example.com"
                      value={otpEmail} onChange={e => setOtpEmail(e.target.value)}
                      onFocus={onFocus} onBlur={onBlur}
                      disabled={otpSent}
                    />
                    {!otpSent
                      ? <button onClick={handleSend} className="btn-primary" disabled={otpLoading}
                          style={{ padding: "0 18px", height: 46, whiteSpace: "nowrap", fontSize: 13 }}>
                          {otpLoading ? "Sending…" : "Send OTP"}
                        </button>
                      : <button onClick={() => { setOtpSent(false); setOtpCode(""); clear(); }}
                          className="btn-ghost"
                          style={{ padding: "0 14px", height: 46, fontSize: 12 }}>
                          Change
                        </button>
                    }
                  </div>
                </div>

                {/* OTP digit boxes */}
                {otpSent && (
                  <form onSubmit={handleVerify}
                    style={{ display: "flex", flexDirection: "column", gap: 16, animation: "slideDown .25s ease both" }}>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label className="label">6-Digit OTP</label>
                        <span style={{ fontFamily: "var(--sans)", fontSize: 11, color: "var(--text-3)" }}>
                          Expires in 10 min
                        </span>
                      </div>

                      {/* ── THE 6 BOXES — width fills the card ── */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
                        {Array.from({ length: N }).map((_, i) => (
                          <input
                            key={i}
                            id={`lg-${i}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={otpCode[i] || ""}
                            onChange={e => handleDigit(i, e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Backspace" && !otpCode[i] && i > 0)
                                document.getElementById(`lg-${i - 1}`)?.focus();
                            }}
                            onPaste={e => {
                              e.preventDefault();
                              const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, N);
                              setOtpCode(p);
                              document.getElementById(`lg-${Math.min(p.length, N - 1)}`)?.focus();
                            }}
                            onFocus={e => {
                              e.target.style.borderColor = "var(--accent-bdr)";
                              e.target.style.boxShadow   = "0 0 0 3px var(--accent-bg)";
                            }}
                            onBlur={e => {
                              e.target.style.boxShadow   = "none";
                              e.target.style.borderColor = otpCode[i] ? "var(--accent-bdr)" : "var(--bdr)";
                            }}
                            style={{
                              /* fills its grid column, square-ish via aspect-ratio */
                              width: "100%",
                              aspectRatio: "1 / 1",
                              maxHeight: 52,
                              textAlign: "center",
                              fontFamily: "var(--serif)",
                              fontSize: "1.25rem",
                              fontWeight: 400,
                              color: "var(--text)",
                              background: otpCode[i] ? "var(--accent-bg)" : "rgba(255,255,255,0.03)",
                              border: `1.5px solid ${otpCode[i] ? "var(--accent-bdr)" : "var(--bdr)"}`,
                              borderRadius: "var(--r-md)",
                              outline: "none",
                              transition: "border-color .15s, background .15s, box-shadow .15s",
                              cursor: "text",
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="btn-primary"
                      disabled={otpLoading || otpCode.length < N}
                      style={{ width: "100%", padding: 13, fontSize: 14 }}>
                      {otpLoading ? "Verifying…" : "Verify & Sign In"}
                    </button>

                    {/* Resend */}
                    <div style={{ textAlign: "center" }}>
                      {timer > 0
                        ? <span style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--text-3)" }}>
                            Resend OTP in <strong style={{ color: "var(--text-2)" }}>{timer}s</strong>
                          </span>
                        : <button type="button" onClick={handleResend} disabled={otpLoading}
                            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 13, color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                            Resend OTP
                          </button>
                      }
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid var(--bdr)", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 300, color: "var(--text-3)" }}>
                Don't have an account?{" "}
                <button onClick={() => navigate("/register")}
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 13, fontWeight: 500, color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  Create one
                </button>
              </p>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}