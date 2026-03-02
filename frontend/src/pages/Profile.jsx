import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser]           = useState({});
  const [editing, setEditing]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({});
  const [toast, setToast]         = useState(null);
  const [mounted, setMounted]     = useState(false);

  // ── Verify flow ──
  const [verifyStep, setVerifyStep] = useState(null); // null | "sending" | "otp"
  const [otp, setOtp]               = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      const u = res.data;
      setUser(u);
      setForm({
        name:        u.name        || "",
        email:       u.email       || "",
        phone:       u.phone       || "",
        age:         u.age         || "",
        dateOfBirth: u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : "",
        city:        u.city        || "",
        country:     u.country     || "",
        nationality: u.nationality || "",
      });
      // Always sync localStorage with latest DB values
      localStorage.setItem("user", JSON.stringify(u));
    } catch {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(stored);
      setForm({ name: stored.name || "", email: stored.email || "" });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await api.put("/profile", form);
      const updated = res.data?.user || res.data;
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setEditing(false);
      showToast("ok", "Profile updated successfully.");
    } catch {
      showToast("err", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Step 1 — send OTP to email
  const handleSendOtp = async () => {
    setOtpLoading(true);
    setVerifyStep("sending");
    try {
      await api.post("/auth/send-otp", { email: user.email, purpose: "login" });
      setVerifyStep("otp");
      setOtp("");
      showToast("ok", `OTP sent to ${user.email}`);
    } catch (err) {
      showToast("err", err?.response?.data?.message || "Failed to send OTP.");
      setVerifyStep(null);
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2 — verify OTP
  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setOtpLoading(true);
    try {
      await api.post("/auth/verify-otp", { email: user.email, otp, purpose: "login" });
      const updatedUser = { ...user, isVerified: true };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setVerifyStep(null);
      setOtp("");
      showToast("ok", "Email verified successfully! ✓");
    } catch (err) {
      showToast("err", err?.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const initials = user.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const joinDate = (() => {
    if (user.createdAt) return new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    return "Recently joined";
  })();

  const PERSONAL_FIELDS = [
    { label: "Full Name",     value: user.name,        icon: "👤" },
    { label: "Email Address", value: user.email,        icon: "✉️" },
    { label: "Phone",         value: user.phone || "—", icon: "📱" },
    { label: "Age",           value: user.age   || "—", icon: "🎂" },
    { label: "Date of Birth", value: user.dateOfBirth
        ? new Date(user.dateOfBirth).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
        : "—",                                           icon: "📅" },
  ];

  const LOCATION_FIELDS = [
    { label: "City",        value: user.city        || "—", icon: "🏙️" },
    { label: "Country",     value: user.country     || "—", icon: "🌍" },
    { label: "Nationality", value: user.nationality || "—", icon: "🗺️" },
  ];

  return (
    <Layout title="Profile">
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.45} }

        .prof-row:hover { background: rgba(255,255,255,0.02) !important; }

        .edit-inp {
          font-family: var(--sans); font-size: 14px; font-weight: 300;
          color: var(--text); background: rgba(94,234,212,0.04);
          border: none; border-bottom: 1.5px solid var(--accent-bdr);
          border-radius: 0; padding: 9px 2px; outline: none; width: 100%;
          transition: border-color .2s, background .2s; box-sizing: border-box;
        }
        .edit-inp:focus { border-bottom-color: var(--accent); background: rgba(94,234,212,0.07); }
        .edit-inp::placeholder { color: var(--text-3); }
        .edit-inp[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }

        .otp-inp {
          font-family: var(--serif); font-size: 1.8rem; font-weight: 400;
          letter-spacing: 0.5em; text-align: center;
          color: var(--accent); background: rgba(94,234,212,0.05);
          border: 1.5px solid var(--accent-bdr); border-radius: var(--r-md);
          padding: 12px 16px; outline: none; width: 100%; box-sizing: border-box;
          transition: border-color .2s, box-shadow .2s;
        }
        .otp-inp:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-bg); }
        .otp-inp::placeholder { color: var(--text-3); font-size: 1rem; letter-spacing: 0.3em; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 999,
          padding: "14px 20px", background: "var(--bg-elevated)",
          border: `1px solid ${toast.type === "ok" ? "rgba(74,222,128,.3)" : "rgba(248,113,113,.3)"}`,
          borderLeft: `3px solid ${toast.type === "ok" ? "var(--ok)" : "var(--err)"}`,
          borderRadius: "var(--r-md)", boxShadow: "var(--shadow-lg)",
          fontFamily: "var(--sans)", fontSize: 13,
          color: toast.type === "ok" ? "var(--ok)" : "var(--err)",
          animation: "slideUp .3s ease both",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span>{toast.type === "ok" ? "✓" : "✕"}</span> {toast.msg}
        </div>
      )}

      {/* Hero banner */}
      <div style={{
        position: "relative", overflow: "hidden",
        borderRadius: "var(--r-xl)", background: "var(--bg-card)",
        backdropFilter: "blur(18px)", border: "1px solid var(--bdr)",
        opacity: mounted ? 1 : 0, animation: mounted ? "fadeIn .5s ease both" : "none",
      }}>
        <div style={{ height: 3, background: "linear-gradient(90deg, var(--accent), #2DD4BF, rgba(94,234,212,0))", borderRadius: "var(--r-xl) var(--r-xl) 0 0" }} />
        <div aria-hidden style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(94,234,212,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ padding: "36px 40px 32px", display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 88, height: 88, borderRadius: "22px",
              background: "linear-gradient(135deg, rgba(94,234,212,0.18) 0%, rgba(45,212,191,0.08) 100%)",
              border: "1.5px solid var(--accent-bdr)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--serif)", fontSize: "2.2rem", color: "var(--accent)",
              boxShadow: "0 8px 32px rgba(94,234,212,0.12)",
            }}>{initials}</div>
            <div style={{ position: "absolute", bottom: 4, right: 4, width: 12, height: 12, borderRadius: "50%", background: "var(--ok)", border: "2px solid var(--bg-surface)", animation: "pulse 2.5s ease infinite" }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 6 }}>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 400, color: "var(--text)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {user.name || "—"}
              </h2>
              <span style={{
                fontFamily: "var(--sans)", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
                color: user.isVerified ? "var(--accent)" : "var(--warn)", opacity: 0.9,
                padding: "3px 10px", borderRadius: 99,
                background: user.isVerified ? "var(--accent-bg)" : "rgba(251,191,36,0.1)",
                border: `1px solid ${user.isVerified ? "var(--accent-bdr)" : "rgba(251,191,36,0.3)"}`,
              }}>
                {user.isVerified ? "✓ Verified" : "⚠ Unverified"}
              </span>
            </div>
            <p style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 300, color: "var(--text-2)", margin: "0 0 6px" }}>{user.email}</p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {user.city && <span style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--text-3)" }}>🏙️ {user.city}{user.country ? `, ${user.country}` : ""}</span>}
              {user.phone && <span style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--text-3)" }}>📱 {user.phone}</span>}
              <span style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--text-3)" }}>● {joinDate}</span>
            </div>
          </div>

          <button onClick={() => setEditing(e => !e)} className={editing ? "btn-ghost" : "btn-primary"} style={{ flexShrink: 0, padding: "10px 22px", fontSize: 13 }}>
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <div style={{ background: "var(--bg-card)", backdropFilter: "blur(18px)", border: "1px solid var(--bdr)", borderRadius: "var(--r-xl)", overflow: "hidden", animation: "slideUp .25s ease both" }}>
          <div style={{ padding: "20px 28px 18px", borderBottom: "1px solid var(--bdr)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--accent-bg)", border: "1px solid var(--accent-bdr)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✏️</div>
              <span className="label" style={{ color: "var(--accent)", opacity: .8 }}>Editing Profile</span>
            </div>
            <button onClick={handleSave} className="btn-primary" style={{ padding: "8px 22px", fontSize: 13 }} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
          <div style={{ padding: "28px" }}>
            <p className="label" style={{ color: "var(--text-3)", marginBottom: 18 }}>Personal Information</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
              {[
                { label: "Full Name",     key: "name",        type: "text",   ph: "Your full name"  },
                { label: "Email Address", key: "email",       type: "email",  ph: "you@example.com" },
                { label: "Phone Number",  key: "phone",       type: "tel",    ph: "+91 XXXXX XXXXX" },
                { label: "Age",           key: "age",         type: "number", ph: "Your age"        },
                { label: "Date of Birth", key: "dateOfBirth", type: "date",   ph: ""                },
              ].map(({ label, key, type, ph }) => (
                <div key={key}>
                  <label className="label" style={{ display: "block", marginBottom: 8 }}>{label}</label>
                  <input className="edit-inp" type={type} placeholder={ph} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <p className="label" style={{ color: "var(--text-3)", marginBottom: 18 }}>Location</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
              {[
                { label: "City",        key: "city",        ph: "Your city"        },
                { label: "Country",     key: "country",     ph: "Your country"     },
                { label: "Nationality", key: "nationality", ph: "Your nationality" },
              ].map(({ label, key, ph }) => (
                <div key={key}>
                  <label className="label" style={{ display: "block", marginBottom: 8 }}>{label}</label>
                  <input className="edit-inp" type="text" placeholder={ph} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View mode cards */}
      {!editing && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Personal */}
          <div style={{ background: "var(--bg-card)", backdropFilter: "blur(18px)", border: "1px solid var(--bdr)", borderRadius: "var(--r-xl)", overflow: "hidden", animation: mounted ? "slideUp .5s .1s ease both" : "none", opacity: mounted ? 1 : 0 }}>
            <div style={{ padding: "20px 28px 18px", borderBottom: "1px solid var(--bdr)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--accent-bg)", border: "1px solid var(--accent-bdr)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>👤</div>
              <span className="label" style={{ color: "var(--accent)", opacity: .8 }}>Personal</span>
            </div>
            <div style={{ padding: "8px 0" }}>
              {PERSONAL_FIELDS.map(({ label, value, icon }, i, arr) => (
                <div key={label} className="prof-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 28px", borderBottom: i < arr.length - 1 ? "1px solid var(--bdr)" : "none", transition: "background .15s", cursor: "default" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13 }}>{icon}</span>
                    <span className="label">{label}</span>
                  </div>
                  <span style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 300, color: "var(--text-2)", maxWidth: "55%", textAlign: "right" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Location */}
            <div style={{ background: "var(--bg-card)", backdropFilter: "blur(18px)", border: "1px solid var(--bdr)", borderRadius: "var(--r-xl)", overflow: "hidden", animation: mounted ? "slideUp .5s .16s ease both" : "none", opacity: mounted ? 1 : 0 }}>
              <div style={{ padding: "20px 28px 18px", borderBottom: "1px solid var(--bdr)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🌍</div>
                <span className="label" style={{ color: "#60A5FA", opacity: .8 }}>Location</span>
              </div>
              <div style={{ padding: "8px 0" }}>
                {LOCATION_FIELDS.map(({ label, value, icon }, i, arr) => (
                  <div key={label} className="prof-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 28px", borderBottom: i < arr.length - 1 ? "1px solid var(--bdr)" : "none", transition: "background .15s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13 }}>{icon}</span>
                      <span className="label">{label}</span>
                    </div>
                    <span style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 300, color: "var(--text-2)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div style={{ background: "var(--bg-card)", backdropFilter: "blur(18px)", border: "1px solid var(--bdr)", borderRadius: "var(--r-xl)", overflow: "hidden", animation: mounted ? "slideUp .5s .22s ease both" : "none", opacity: mounted ? 1 : 0 }}>
              <div style={{ padding: "20px 28px 18px", borderBottom: "1px solid var(--bdr)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🔒</div>
                <span className="label" style={{ color: "var(--warn)", opacity: .8 }}>Security</span>
              </div>

              {/* Verified row — dynamic */}
              <div style={{ padding: "16px 28px", borderBottom: "1px solid var(--bdr)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: verifyStep === "otp" ? 14 : 0 }}>
                  <span className="label">Verified</span>
                  {user.isVerified ? (
                    <span style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--ok)" }}>✓ Email verified</span>
                  ) : verifyStep === "otp" ? (
                    <span style={{ fontFamily: "var(--sans)", fontSize: 11, color: "var(--text-3)" }}>
                      OTP sent to <strong style={{ color: "var(--text-2)" }}>{user.email}</strong>
                    </span>
                  ) : (
                    <button
                      onClick={handleSendOtp}
                      disabled={otpLoading || verifyStep === "sending"}
                      style={{
                        fontFamily: "var(--sans)", fontSize: 12, fontWeight: 600,
                        padding: "6px 16px", borderRadius: 99, cursor: "pointer",
                        background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.35)",
                        color: "var(--warn)", transition: "background .2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(251,191,36,0.2)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(251,191,36,0.1)"}
                    >
                      {verifyStep === "sending" ? "Sending OTP…" : "Verify Email →"}
                    </button>
                  )}
                </div>

                {/* OTP input — shown inline when step = "otp" */}
                {verifyStep === "otp" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "slideUp .2s ease both" }}>
                    <input
                      className="otp-inp"
                      type="text" inputMode="numeric" maxLength={6}
                      placeholder="······"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={handleVerifyOtp} className="btn-primary"
                        style={{ flex: 1, padding: "9px 0", fontSize: 13 }}
                        disabled={otpLoading || otp.length < 6}>
                        {otpLoading ? "Verifying…" : "Confirm OTP"}
                      </button>
                      <button onClick={handleSendOtp} className="btn-ghost"
                        style={{ padding: "9px 16px", fontSize: 12 }}
                        disabled={otpLoading}>
                        Resend
                      </button>
                      <button onClick={() => { setVerifyStep(null); setOtp(""); }} className="btn-ghost"
                        style={{ padding: "9px 16px", fontSize: 12 }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Static rows */}
              {[
                { label: "Login Method", value: "Email / OTP" },
                { label: "Password",     value: "••••••••••••" },
              ].map(({ label, value }, i, arr) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 28px", borderBottom: i < arr.length - 1 ? "1px solid var(--bdr)" : "none" }}>
                  <span className="label">{label}</span>
                  <span style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 300, color: "var(--text-2)" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Danger zone */}
            <div style={{ background: "var(--bg-card)", backdropFilter: "blur(18px)", border: "1px solid rgba(248,113,113,.15)", borderRadius: "var(--r-xl)", overflow: "hidden", animation: mounted ? "slideUp .5s .28s ease both" : "none", opacity: mounted ? 1 : 0 }}>
              <div style={{ padding: "20px 28px 18px", borderBottom: "1px solid rgba(248,113,113,.1)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--err-bg)", border: "1px solid rgba(248,113,113,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⚠️</div>
                <span className="label" style={{ color: "var(--err)", opacity: .8 }}>Danger Zone</span>
              </div>
              <div style={{ padding: "22px 28px" }}>
                <p style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 300, color: "var(--text-3)", marginBottom: 16, lineHeight: 1.6 }}>
                  Signing out will end your current session and return you to the login screen.
                </p>
                <button onClick={handleLogout}
                  style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 500, padding: "10px 24px", borderRadius: "var(--r-md)", cursor: "pointer", background: "var(--err-bg)", border: "1px solid rgba(248,113,113,.3)", color: "var(--err)", transition: "all .2s", display: "flex", alignItems: "center", gap: 8 }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,.18)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--err-bg)"; e.currentTarget.style.transform = "none"; }}
                >
                  <span>→</span> Sign Out
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </Layout>
  );
}