import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import AppBackground from "./AppBackground";
import { useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Layout({ title, children }) {
  const location = useLocation();
  const isHome   = location.pathname === "/";
  const { dark } = useTheme();

  return (
    <div style={{
      minHeight:"100vh", overflowX:"hidden",
      background: dark ? "var(--bg)" : "#f0ece0",
      color: dark ? "var(--text)" : "#1a1a2e",
      fontFamily:"var(--sans)",
      position:"relative",
    }}>
      {dark && <AppBackground />}

      {!dark && (
        <div aria-hidden="true" style={{
          position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
          background:"radial-gradient(ellipse 110% 90% at 50% 0%, #fdf8ee 0%, #f0ece0 55%, #e8e2d4 100%)",
        }} />
      )}

      <div style={{ position:"relative", zIndex:1 }}>
        <Navbar />

        {isHome ? children : (
          <div style={{
            maxWidth:1152, margin:"0 auto",
            padding:"40px 28px 80px",
            display:"flex", flexDirection:"column", gap:24,
          }}>
            {title && (
              <div>
                <p className="label" style={{ marginBottom:6, color:"var(--accent)", opacity:.7 }}>Overview</p>
                <h1 style={{
                  fontFamily:"var(--serif)", fontSize:"2rem", fontWeight:400,
                  color: dark ? "var(--text)" : "#1a1a2e", margin:0,
                }}>
                  {title}
                </h1>
              </div>
            )}
            {children}
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
}