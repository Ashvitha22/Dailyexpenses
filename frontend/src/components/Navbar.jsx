import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV = [
  { path: "/dashboard",    label: "Dashboard",  icon: "🏠" },
  { path: "/analytics",    label: "Analytics",  icon: "📊" },
  { path: "/budgets",      label: "Budgets",    icon: "💰" },
  { path: "/goals",        label: "Goals",      icon: "🎯" },
  { path: "/achievements", label: "Streaks",    icon: "🏆" },
  { path: "/networth",     label: "Net Worth",  icon: "📈" },
  { path: "/income", label: "Income", icon: "💵" },
  { path: "/profile",      label: "Profile",    icon: "👤" },
  
];

export default function Navbar() {
  const [open, setOpen]  = useState(false);
  const navigate         = useNavigate();
  const location         = useLocation();
  const token            = localStorage.getItem("token");
  const isAddPage        = location.pathname === "/add-expense";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      height: 64,
      background: "rgba(10,10,15,0.88)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--bdr)",
      display: "flex", alignItems: "center",
    }}>
      <div style={{
        maxWidth: 1280, width: "100%", margin: "0 auto",
        padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12,
      }}>

        {/* ── Brand ── */}
        <button
          onClick={() => navigate(token ? "/dashboard" : "/")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "baseline", gap: 1, flexShrink: 0,
          }}>
          <span style={{
            fontFamily: "var(--serif)", fontSize: "1.3rem",
            color: "var(--text)", letterSpacing: "-0.01em",
          }}>
            DailyExpense
          </span>
          <span style={{ color: "var(--accent)", fontSize: "1.5rem", lineHeight: 1 }}>.</span>
        </button>

        {/* ── Logged out ── */}
        {!token ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => navigate("/login")} className="btn-ghost" style={{ padding: "8px 18px" }}>
              Login
            </button>
            <button onClick={() => navigate("/register")} className="btn-primary" style={{ padding: "8px 20px" }}>
              Sign Up
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>

            {/* ── Nav links with icons ── */}
            <div style={{
              display: "flex", alignItems: "center",
              gap: 0, marginRight: 8,
              flexWrap: "nowrap", overflowX: "auto",
            }}>
              {NAV.map(({ path, label, icon }) => {
                const active = location.pathname === path;
                return (
                  <button key={path} onClick={() => navigate(path)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontFamily: "var(--sans)", fontSize: 13,
                      fontWeight: active ? 500 : 400,
                      color: active ? "var(--accent)" : "var(--text-2)",
                      transition: "color .2s, background .15s",
                      padding: "8px 10px",
                      borderRadius: "var(--r-sm)",
                      position: "relative",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                    onMouseEnter={e => {
                      if (!active) e.currentTarget.style.color = "var(--text)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={e => {
                      if (!active) e.currentTarget.style.color = "var(--text-2)";
                      e.currentTarget.style.background = "none";
                    }}
                  >
                    {/* Icon */}
                    <span style={{
                      fontSize: 13,
                      opacity: active ? 1 : 0.65,
                      transition: "opacity .2s",
                      lineHeight: 1,
                    }}>
                      {icon}
                    </span>

                    {/* Label */}
                    {label}

                    {/* Active underline */}
                    {active && (
                      <span style={{
                        position: "absolute", bottom: 0,
                        left: "50%", transform: "translateX(-50%)",
                        width: "60%", height: 2,
                        background: "var(--accent)",
                        borderRadius: "2px 2px 0 0",
                      }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Add Expense button ── */}
            <button
              onClick={() => navigate("/add-expense")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                fontFamily: "var(--sans)", fontSize: 13, fontWeight: 600,
                color: "#0A0A0F",
                background: "linear-gradient(135deg, var(--accent) 0%, #2DD4BF 100%)",
                border: "none", borderRadius: "var(--r-md)",
                padding: "9px 16px",
                cursor: "pointer",
                transition: "transform .15s, box-shadow .2s",
                boxShadow: isAddPage
                  ? "0 6px 20px rgba(94,234,212,0.35)"
                  : "0 2px 12px rgba(94,234,212,0.22)",
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(94,234,212,0.32)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(94,234,212,0.22)";
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 400 }}>+</span>
              Add Expense
            </button>

            {/* ── Avatar — Logout only ── */}
            <div style={{ position: "relative", marginLeft: 6 }}>
              <button
                onClick={() => setOpen(o => !o)}
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "var(--accent-bg)",
                  border: "1px solid var(--accent-bdr)",
                  color: "var(--accent)",
                  fontFamily: "var(--sans)", fontWeight: 600, fontSize: 13,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background .2s",
                  flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(94,234,212,0.18)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--accent-bg)"}
              >
                U
              </button>

              {open && (
                <>
                  <div onClick={() => setOpen(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 90 }} />
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 91,
                    width: 140,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--bdr-2)",
                    borderRadius: "var(--r-md)",
                    boxShadow: "var(--shadow-lg)",
                    overflow: "hidden",
                    animation: "slideDown .2s ease both",
                  }}>
                    <button onClick={logout}
                      style={{
                        width: "100%", textAlign: "left",
                        padding: "12px 16px",
                        background: "none", border: "none", cursor: "pointer",
                        fontFamily: "var(--sans)", fontSize: 13,
                        color: "var(--err)",
                        transition: "background .15s",
                        display: "flex", alignItems: "center", gap: 8,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      <span>🚪</span> Logout
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        )}
      </div>
    </nav>
  );
}