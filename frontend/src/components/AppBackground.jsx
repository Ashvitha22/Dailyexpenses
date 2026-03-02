import { useLocation } from "react-router-dom";

/**
 * AppBackground.jsx
 * Real Unsplash photos — one per page — all finance/expense themed.
 * Each image is darkened with a gradient overlay so text stays readable.
 * Place in src/components/ and import in Layout.jsx
 */

// ── Verified real Unsplash photo IDs ────────────────────────────────────────
// Format: https://images.unsplash.com/photo-{ID}?w=1920&q=80&fit=crop
const PAGE_IMAGES = {
  // Home — dark stock market chart screens (Maxim Hopman)
  "/":
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&q=80&fit=crop",

  // Dashboard — person with finance charts on laptop (rc.xyz)
  "/dashboard":
    "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1920&q=80&fit=crop",

  // Analytics — data analytics dashboard on screen (Jakub Żerdzicki)
  "/analytics":
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80&fit=crop",

  // Budgets — gold coins stacked on dark surface (Scottsdale Mint)
  "/budgets":
    "https://images.unsplash.com/photo-1609025500888-893b9e2d6a5c?w=1920&q=80&fit=crop",

  // Goals — piggy bank savings on dark (PiggyBank)
  "/goals":
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1920&q=80&fit=crop",

  // Profile — professional finance workspace (Scott Graham)
  "/profile":
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1920&q=80&fit=crop",

  // Login — dark luxury finance abstract (Behnam Norouzi)
  "/login":
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&q=80&fit=crop",

  // Register — same as login
  "/register":
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&q=80&fit=crop",
};

// Fallback image
const FALLBACK =
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&q=80&fit=crop";

// How dark to make the overlay per page (some pages need lighter/darker)
const OVERLAY_OPACITY = {
  "/":          0.80,
  "/dashboard": 0.85,
  "/analytics": 0.85,
  "/budgets":   0.83,
  "/goals":     0.83,
  "/profile":   0.84,
  "/login":     0.80,
  "/register":  0.80,
};

export default function AppBackground() {
  const location   = useLocation();
  const imageUrl   = PAGE_IMAGES[location.pathname] || FALLBACK;
  const overlayOpc = OVERLAY_OPACITY[location.pathname] ?? 0.84;

  return (
    <>
      <style>{`
        @keyframes bgSlowZoom {
          from { transform: scale(1.06); }
          to   { transform: scale(1.00); }
        }
        @keyframes goldGlow {
          0%,100% { opacity: 0.22; }
          50%      { opacity: 0.32; }
        }
        .bg-img    { animation: bgSlowZoom 10s ease-out forwards; }
        .gold-glow { animation: goldGlow   8s ease-in-out infinite; }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {/* ── 1. Actual Unsplash photo ── */}
        <div
          className="bg-img"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("${imageUrl}")`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* ── 2. Dark overlay so UI elements stay readable ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(5, 5, 14, ${overlayOpc})`,
          }}
        />

        {/* ── 3. Gold radial glow — top left (matches theme accent) ── */}
        <div
          className="gold-glow"
          style={{
            position: "absolute",
            top: "-12%",
            left: "-8%",
            width: "640px",
            height: "640px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(212,168,67,0.18) 0%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />

        {/* ── 4. Indigo glow — bottom right ── */}
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            right: "-10%",
            width: "580px",
            height: "580px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(55,48,163,0.22) 0%, transparent 60%)",
            filter: "blur(70px)",
            opacity: 0.6,
          }}
        />

        {/* ── 5. Vignette — darkens edges so center stays bright ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 30%, rgba(0,0,0,0.60) 100%)",
          }}
        />

        {/* ── 6. Top fade — so navbar blends in ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "120px",
            background:
              "linear-gradient(to bottom, rgba(5,5,14,0.7) 0%, transparent 100%)",
          }}
        />

        {/* ── 7. Bottom fade — content stays readable ── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "200px",
            background:
              "linear-gradient(to top, rgba(5,5,14,0.75) 0%, transparent 100%)",
          }}
        />
      </div>
    </>
  );
}