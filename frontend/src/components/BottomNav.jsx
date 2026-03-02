import { useNavigate, useLocation } from "react-router-dom";

const ITEMS = [
  { path: "/dashboard", icon: "🏠", label: "Home"      },
  { path: "/analytics", icon: "📊", label: "Analytics"  },
  { path: "/goals",     icon: "🎯", label: "Goals"       },
  { path: "/budgets",   icon: "💰", label: "Budgets"     },
  { path: "/profile",   icon: "👤", label: "Profile"     },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const token    = localStorage.getItem("token");

  if (!token) return null;

  return (
    <>
      <div style={{ height: 72 }} id="bottom-spacer" />

      <nav id="bottom-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 99,
        background: "rgba(17,17,26,0.94)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderTop: "1px solid var(--bdr)",
        display: "none",
      }}>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "6px 8px 14px" }}>

          {/* First 2 items */}
          {ITEMS.slice(0, 2).map(({ path, icon, label }) => {
            const active = location.pathname === path;
            return (
              <button key={path} onClick={() => navigate(path)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  padding: "6px 10px",
                }}>
                <span style={{ fontSize: 20, transform: active ? "scale(1.15)" : "scale(1)", transition: "transform .15s" }}>{icon}</span>
                <span style={{ fontFamily: "var(--sans)", fontSize: 10, fontWeight: active ? 500 : 400, color: active ? "var(--accent)" : "var(--text-3)" }}>
                  {label}
                </span>
                {active && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)" }} />}
              </button>
            );
          })}

          {/* Centre: Add Expense */}
          <button onClick={() => navigate("/add-expense")}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              background: "none", border: "none", cursor: "pointer", padding: "0 10px",
            }}>
            <div style={{
              width: 46, height: 46, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), #2DD4BF)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, color: "var(--bg)",
              boxShadow: "0 4px 16px rgba(94,234,212,0.35)",
              marginBottom: 2,
            }}>+</div>
            <span style={{ fontFamily: "var(--sans)", fontSize: 10, fontWeight: 500, color: "var(--accent)" }}>Add</span>
          </button>

          {/* Last 2 items */}
          {ITEMS.slice(2, 4).map(({ path, icon, label }) => {
            const active = location.pathname === path;
            return (
              <button key={path} onClick={() => navigate(path)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  padding: "6px 10px",
                }}>
                <span style={{ fontSize: 20, transform: active ? "scale(1.15)" : "scale(1)", transition: "transform .15s" }}>{icon}</span>
                <span style={{ fontFamily: "var(--sans)", fontSize: 10, fontWeight: active ? 500 : 400, color: active ? "var(--accent)" : "var(--text-3)" }}>
                  {label}
                </span>
                {active && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)" }} />}
              </button>
            );
          })}

          {/* Profile */}
          <button onClick={() => navigate("/profile")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "6px 10px",
            }}>
            <span style={{ fontSize: 20, transform: location.pathname === "/profile" ? "scale(1.15)" : "scale(1)", transition: "transform .15s" }}>👤</span>
            <span style={{ fontFamily: "var(--sans)", fontSize: 10, fontWeight: location.pathname === "/profile" ? 500 : 400, color: location.pathname === "/profile" ? "var(--accent)" : "var(--text-3)" }}>
              Profile
            </span>
            {location.pathname === "/profile" && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)" }} />}
          </button>
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          #bottom-nav    { display: block !important; }
          #bottom-spacer { display: block !important; }
        }
      `}</style>
    </>
  );
}