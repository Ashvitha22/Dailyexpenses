import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { registerUser, sendOtp, verifyOtp } from "../services/authService";

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

const FEATURES = [
  { icon: "📊", text: "Visual analytics & charts" },
  { icon: "🎯", text: "Savings goal tracker" },
  { icon: "🔔", text: "Smart budget alerts" },
  { icon: "📤", text: "Export to CSV" },
];

export default function Register() {
  const navigate = useNavigate();
  const [tab, setTab]             = useState("password");
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  // password
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [pwLoading, setPwLoad]    = useState(false);

  // otp
  const [otpName, setOtpName]     = useState("");
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

  const handleRegister = async e => {
    e.preventDefault(); clear();
    try {
      setPwLoad(true);
      await registerUser({ name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally { setPwLoad(false); }
  };

  const handleSend = async () => {
    clear();
    if (!otpName.trim()) { setError("Please enter your name."); return; }
    if (!otpEmail.trim()) { setError("Please enter your email."); return; }
    try {
      setOtpLoad(true);
      await sendOtp(otpEmail, "signup", otpName);
      setOtpSent(true);
      setSuccess(`Verification OTP sent to ${otpEmail} — check your inbox.`);
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
      const res = await verifyOtp(otpEmail, otpCode, "signup");
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
      await sendOtp(otpEmail, "signup", otpName);
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
    if (d && i < N - 1) document.getElementById(`rg-${i + 1}`)?.focus();
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

  /* ── shared OTP box grid — reused in both pages ── */
  const OtpBoxes = ({ prefix }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
      {Array.from({ length: N }).map((_, i) => (
        <input
          key={i}
          id={`${prefix}-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otpCode[i] || ""}
          onChange={e => handleDigit(i, e.target.value)}
          onKeyDown={e => {
            if (e.key === "Backspace" && !otpCode[i] && i > 0)
              document.getElementById(`${prefix}-${i - 1}`)?.focus();
          }}
          onPaste={e => {
            e.preventDefault();
            const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, N);
            setOtpCode(p);
            document.getElementById(`${prefix}-${Math.min(p.length, N - 1)}`)?.focus();
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
  );

  return (
    <Layout>
      <div style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: 840, display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 36, alignItems: "start" }}>

          {/* ── Left: feature list ── */}
          <div className="anim-1" style={{ paddingTop: 8 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--accent-bg)", border: "1px solid var(--accent-bdr)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 20 }}>💰</div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.75rem", fontWeight: 400, color: "var(--text)", marginBottom: 10, lineHeight: 1.2 }}>
              Take control of your finances
            </h2>
            <p style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 300, color: "var(--text-2)", marginBottom: 28, lineHeight: 1.65 }}>
              Join thousands tracking their expenses with DailyExpense.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
              {FEATURES.map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{icon}</div>
                  <span style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 300, color: "var(--text-2)" }}>{text}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 99, background: "var(--accent-bg)", border: "1px solid var(--accent-bdr)" }}>
              <span>📧</span>
              <span style={{ fontFamily: "var(--sans)", fontSize: 12, fontWeight: 500, color: "var(--accent)" }}>No password? Sign up with OTP</span>
            </div>
          </div>

          {/* ── Right: form card ── */}
          <div className="card anim-2">
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.45rem", fontWeight: 400, color: "var(--text)", marginBottom: 20 }}>
              Create account
            </h3>

            {/* Tab switcher */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, background: "rgba(255,255,255,0.03)", border: "1px solid var(--bdr)", borderRadius: "var(--r-md)", padding: 4, marginBottom: 22 }}>
              {tabBtn("password", "🔑", "Password")}
              {tabBtn("otp", "📧", "OTP Email")}
            </div>

            {/* Banners */}
            {error   && <div style={{ padding: "11px 14px", borderRadius: "var(--r-md)", marginBottom: 16, background: "var(--err-bg)", border: "1px solid rgba(248,113,113,.3)", color: "var(--err)", fontFamily: "var(--sans)", fontSize: 13 }}>{error}</div>}
            {success && <div style={{ padding: "11px 14px", borderRadius: "var(--r-md)", marginBottom: 16, background: "var(--ok-bg)", border: "1px solid rgba(74,222,128,.3)", color: "var(--ok)", fontFamily: "var(--sans)", fontSize: 13 }}>{success}</div>}

            {/* ── PASSWORD TAB ── */}
            {tab === "password" && (
              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                {[
                  { label: "Full Name",      type: "text",     ph: "Your full name",      val: name,     set: setName     },
                  { label: "Email Address",  type: "email",    ph: "you@example.com",     val: email,    set: setEmail    },
                  { label: "Password",       type: "password", ph: "Min. 8 characters",   val: password, set: setPassword },
                ].map(({ label, type, ph, val, set }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <label className="label">{label}</label>
                    <input style={baseInp} type={type} placeholder={ph} value={val}
                      onChange={e => set(e.target.value)} onFocus={onFocus} onBlur={onBlur} required />
                  </div>
                ))}
                <button type="submit" className="btn-primary" disabled={pwLoading}
                  style={{ width: "100%", padding: 13, fontSize: 14, marginTop: 4 }}>
                  {pwLoading ? "Creating account…" : "Create Account"}
                </button>
              </form>
            )}

            {/* ── OTP TAB ── */}
            {tab === "otp" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <label className="label">Full Name</label>
                  <input style={baseInp} placeholder="Your full name"
                    value={otpName} onChange={e => setOtpName(e.target.value)}
                    onFocus={onFocus} onBlur={onBlur} disabled={otpSent} />
                </div>

                {/* Email + send */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <label className="label">Email Address</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input style={{ ...baseInp, flex: 1 }} type="email" placeholder="you@example.com"
                      value={otpEmail} onChange={e => setOtpEmail(e.target.value)}
                      onFocus={onFocus} onBlur={onBlur} disabled={otpSent} />
                    {!otpSent
                      ? <button onClick={handleSend} className="btn-primary" disabled={otpLoading}
                          style={{ padding: "0 16px", height: 46, fontSize: 13, whiteSpace: "nowrap" }}>
                          {otpLoading ? "Sending…" : "Send OTP"}
                        </button>
                      : <button onClick={() => { setOtpSent(false); setOtpCode(""); clear(); }}
                          className="btn-ghost"
                          style={{ padding: "0 12px", height: 46, fontSize: 12 }}>
                          Change
                        </button>
                    }
                  </div>
                </div>

                {/* OTP boxes */}
                {otpSent && (
                  <form onSubmit={handleVerify}
                    style={{ display: "flex", flexDirection: "column", gap: 14, animation: "slideDown .25s ease both" }}>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label className="label">Verification OTP</label>
                        <span style={{ fontFamily: "var(--sans)", fontSize: 11, color: "var(--text-3)" }}>Expires in 10 min</span>
                      </div>
                      <OtpBoxes prefix="rg" />
                    </div>

                    <button type="submit" className="btn-primary"
                      disabled={otpLoading || otpCode.length < N}
                      style={{ width: "100%", padding: 13, fontSize: 14 }}>
                      {otpLoading ? "Verifying…" : "Verify & Create Account"}
                    </button>

                    <div style={{ textAlign: "center" }}>
                      {timer > 0
                        ? <span style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--text-3)" }}>
                            Resend in <strong style={{ color: "var(--text-2)" }}>{timer}s</strong>
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
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--bdr)", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 300, color: "var(--text-3)" }}>
                Already have an account?{" "}
                <button onClick={() => navigate("/login")}
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 13, fontWeight: 500, color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  Sign in
                </button>
              </p>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}