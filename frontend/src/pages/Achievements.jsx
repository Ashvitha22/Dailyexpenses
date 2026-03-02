import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getExpenses } from "../services/expenseService";
import { getBudgets }  from "../services/budgetService";

// ─── Achievement definitions ──────────────────────────────────────
const ACHIEVEMENTS = [
  // Expense milestones
  { id: "first_expense",   icon: "🌱", label: "First Step",        desc: "Logged your very first expense",            tier: "bronze", check: (e)      => e.length >= 1            },
  { id: "ten_expenses",    icon: "📝", label: "Getting Serious",   desc: "Logged 10 or more expenses",               tier: "bronze", check: (e)      => e.length >= 10           },
  { id: "fifty_expenses",  icon: "📚", label: "Power Tracker",     desc: "Logged 50 or more expenses",               tier: "silver", check: (e)      => e.length >= 50           },
  { id: "hundred_expenses",icon: "💯", label: "Century Club",      desc: "Logged 100 expenses — incredible!",        tier: "gold",   check: (e)      => e.length >= 100          },

  // Spending control
  { id: "budget_set",      icon: "🎯", label: "Budget Setter",     desc: "Set at least one category budget",         tier: "bronze", check: (_,b)    => b.length >= 1            },
  { id: "all_budgets",     icon: "🏦", label: "Full Control",      desc: "Set budgets for all 5 categories",         tier: "silver", check: (_,b)    => b.length >= 5            },
  { id: "under_budget",    icon: "✅", label: "In the Green",      desc: "All budgets currently under limit",        tier: "silver", check: (_,b)    => b.length > 0 && b.every(x => (x.remaining||0) > 0) },
  { id: "perfect_budget",  icon: "🌟", label: "Budget Master",     desc: "Spent less than 80% on every budget",     tier: "gold",   check: (_,b)    => b.length > 0 && b.every(x => (x.spent/x.amount) < 0.8) },

  // Savings
  { id: "goal_created",    icon: "🎪", label: "Dream Big",         desc: "Created your first savings goal",          tier: "bronze", check: (_,_2,g) => g.length >= 1            },
  { id: "goal_half",       icon: "🚀", label: "Halfway There",     desc: "Reached 50% on any savings goal",          tier: "silver", check: (_,_2,g) => g.some(x => x.saved/x.target >= 0.5) },
  { id: "goal_complete",   icon: "🏆", label: "Goal Crusher",      desc: "Completed a savings goal — you did it!",  tier: "gold",   check: (_,_2,g) => g.some(x => x.saved >= x.target) },
  { id: "three_goals",     icon: "🌈", label: "Dreamer",           desc: "Created 3 or more savings goals",          tier: "silver", check: (_,_2,g) => g.length >= 3            },

  // Category variety
  { id: "multi_cat",       icon: "🎨", label: "Diverse Spender",   desc: "Logged expenses in 4+ categories",        tier: "bronze", check: (e)      => new Set(e.map(x=>x.category)).size >= 4 },
  { id: "tagger",          icon: "🏷️",  label: "Tag Pro",           desc: "Used tags on 5 or more expenses",          tier: "bronze", check: (e)      => e.filter(x=>(x.tags||[]).length>0).length >= 5 },
  { id: "noted",           icon: "📌", label: "Detail Oriented",   desc: "Added notes to 10 or more expenses",      tier: "silver", check: (e)      => e.filter(x=>x.notes).length >= 10 },

  // Special
  { id: "big_saver",       icon: "💰", label: "Big Saver",         desc: "Total savings across goals exceeds ₹10,000", tier: "gold", check: (_,_2,g) => g.reduce((s,x)=>s+x.saved,0) >= 10000 },
  { id: "analyst",         icon: "📊", label: "Data Nerd",         desc: "Have expenses in the last 30 days",        tier: "bronze", check: (e)      => e.some(x => (Date.now()-new Date(x.date||x.createdAt).getTime()) < 30*86400000) },
];

const TIER_STYLE = {
  bronze: { color: "#CD7F32", bg: "rgba(205,127,50,0.10)", bdr: "rgba(205,127,50,0.25)", glow: "rgba(205,127,50,0.15)" },
  silver: { color: "#C0C0C0", bg: "rgba(192,192,192,0.10)", bdr: "rgba(192,192,192,0.25)", glow: "rgba(192,192,192,0.12)" },
  gold:   { color: "#FFD700", bg: "rgba(255,215,0,0.10)",   bdr: "rgba(255,215,0,0.28)",  glow: "rgba(255,215,0,0.18)"  },
};

// ─── Streak calculator ────────────────────────────────────────────
function calcStreak(expenses) {
  if (!expenses.length) return { current: 0, best: 0, activeDays: [] };

  const today    = new Date(); today.setHours(0,0,0,0);
  const spentDays = new Set(
    expenses.map(e => {
      const d = new Date(e.date || e.createdAt); d.setHours(0,0,0,0);
      return d.getTime();
    })
  );

  // current streak — consecutive days going back from today
  let current = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    if (spentDays.has(d.getTime())) current++;
    else break;
  }

  // best streak ever
  const sorted = [...spentDays].sort((a,b)=>a-b);
  let best = 0, run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i-1] === 86400000) { run++; best = Math.max(best, run); }
    else run = 1;
  }
  best = Math.max(best, current, sorted.length ? 1 : 0);

  // last 14 days for heatmap
  const activeDays = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    activeDays.push({ date: d, active: spentDays.has(d.getTime()) });
  }

  return { current, best, activeDays };
}

export default function Achievements() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets]   = useState([]);
  const [goals, setGoals]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all"); // all | unlocked | locked
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    Promise.all([getExpenses(), getBudgets()])
      .then(([e, b]) => { setExpenses(e.data); setBudgets(b.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
    try { setGoals(JSON.parse(localStorage.getItem("savings_goals") || "[]")); } catch {}
  }, []);

  const unlocked = useMemo(() =>
    ACHIEVEMENTS.filter(a => a.check(expenses, budgets, goals)),
    [expenses, budgets, goals]
  );
  const unlockedIds = new Set(unlocked.map(a => a.id));

  const streak = useMemo(() => calcStreak(expenses), [expenses]);

  const displayed = ACHIEVEMENTS.filter(a =>
    filter === "all"     ? true :
    filter === "unlocked"? unlockedIds.has(a.id) :
                           !unlockedIds.has(a.id)
  );

  const pct = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);

  return (
    <Layout title="Achievements">
      <style>{`
        @keyframes popIn    { 0%{opacity:0;transform:scale(.85)} 100%{opacity:1;transform:scale(1)} }
        @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes floatUp  { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes glow     { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes countUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        .badge-card:hover { transform: translateY(-3px) !important; }
        .badge-card:hover .badge-icon { transform: scale(1.15); }
        .badge-icon { transition: transform .25s ease; }

        .filter-btn { transition: all .18s ease; }
        .filter-btn:hover { opacity: 1 !important; }
      `}</style>

      {/* ── Hero stat row ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 1, borderRadius: "var(--r-xl)", overflow: "hidden",
        background: "var(--bdr)", border: "1px solid var(--bdr)",
        opacity: mounted ? 1 : 0, animation: mounted ? "floatUp .5s ease both" : "none",
      }}>
        {[
          {
            top: "Current Streak",
            main: `${streak.current}`,
            sub: "days in a row",
            icon: "🔥",
            color: streak.current >= 7 ? "#FB923C" : streak.current >= 3 ? "#FBBF24" : "var(--text-2)",
          },
          {
            top: "Best Streak",
            main: `${streak.best}`,
            sub: "days ever",
            icon: "⚡",
            color: "var(--accent)",
          },
          {
            top: "Achievements",
            main: `${unlocked.length}/${ACHIEVEMENTS.length}`,
            sub: `${pct}% complete`,
            icon: "🏆",
            color: "#FFD700",
          },
        ].map(({ top, main, sub, icon, color }, i) => (
          <div key={top} style={{
            background: "var(--bg-card)", backdropFilter: "blur(16px)",
            padding: "26px 28px", position: "relative", overflow: "hidden",
            animation: mounted ? `floatUp .5s ${i * 0.08}s ease both` : "none",
          }}>
            <div style={{ position: "absolute", top: 14, right: 16, fontSize: 22, opacity: .25 }}>{icon}</div>
            <p className="label" style={{ marginBottom: 10, color: "var(--text-3)" }}>{top}</p>
            <p style={{
              fontFamily: "var(--serif)", fontSize: "2.4rem", lineHeight: 1,
              color, marginBottom: 6,
              animation: mounted ? `countUp .6s ${i * 0.1 + 0.2}s ease both` : "none",
              opacity: mounted ? 1 : 0,
            }}>{main}</p>
            <p style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--text-3)", fontWeight: 300 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── 14-day activity heatmap ── */}
      <div className="card" style={{
        opacity: mounted ? 1 : 0, animation: mounted ? "floatUp .5s .15s ease both" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <p className="label" style={{ color: "var(--accent)", opacity: .7, marginBottom: 3 }}>Activity</p>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 400, color: "var(--text)", margin: 0 }}>
              Last 14 Days
            </h3>
          </div>
          {streak.current > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 99,
              background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.25)",
            }}>
              <span style={{ fontSize: 14 }}>🔥</span>
              <span style={{ fontFamily: "var(--sans)", fontSize: 12, fontWeight: 600, color: "#FB923C" }}>
                {streak.current} day streak!
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
          {streak.activeDays.map(({ date, active }, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{
                width: "100%", height: 36, borderRadius: 6,
                background: active
                  ? "linear-gradient(180deg, var(--accent) 0%, #2DD4BF 100%)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? "var(--accent-bdr)" : "var(--bdr)"}`,
                boxShadow: active ? "0 2px 12px rgba(94,234,212,0.25)" : "none",
                transition: "all .2s",
              }} />
              <span style={{
                fontFamily: "var(--sans)", fontSize: 9, fontWeight: 400,
                color: active ? "var(--accent)" : "var(--text-3)",
              }}>
                {date.toLocaleDateString("en", { weekday: "short" }).slice(0,1)}
                {date.getDate()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="card" style={{
        opacity: mounted ? 1 : 0, animation: mounted ? "floatUp .5s .2s ease both" : "none",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div>
            <p className="label" style={{ color: "var(--accent)", opacity: .7, marginBottom: 3 }}>Progress</p>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 400, color: "var(--text)", margin: 0 }}>
              Overall Completion
            </h3>
          </div>
          <span style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", color: "#FFD700" }}>{pct}%</span>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: "linear-gradient(90deg, var(--accent), #FFD700)",
            borderRadius: 99, transition: "width 1s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontFamily: "var(--sans)", fontSize: 11, color: "var(--text-3)" }}>
            {unlocked.length} unlocked
          </span>
          <span style={{ fontFamily: "var(--sans)", fontSize: 11, color: "var(--text-3)" }}>
            {ACHIEVEMENTS.length - unlocked.length} remaining
          </span>
        </div>
      </div>

      {/* ── Badge grid ── */}
      <div style={{ opacity: mounted ? 1 : 0, animation: mounted ? "floatUp .5s .25s ease both" : "none" }}>
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center" }}>
          <p className="label" style={{ marginRight: 4, color: "var(--text-3)" }}>Show:</p>
          {[
            { id: "all",      label: `All (${ACHIEVEMENTS.length})` },
            { id: "unlocked", label: `✓ Unlocked (${unlocked.length})` },
            { id: "locked",   label: `🔒 Locked (${ACHIEVEMENTS.length - unlocked.length})` },
          ].map(({ id, label }) => (
            <button key={id} className="filter-btn"
              onClick={() => setFilter(id)}
              style={{
                fontFamily: "var(--sans)", fontSize: 12, fontWeight: filter === id ? 600 : 400,
                padding: "6px 16px", borderRadius: 99, cursor: "pointer",
                background: filter === id ? "var(--accent-bg)" : "transparent",
                border: `1px solid ${filter === id ? "var(--accent-bdr)" : "var(--bdr)"}`,
                color: filter === id ? "var(--accent)" : "var(--text-3)",
                opacity: filter === id ? 1 : 0.7,
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {displayed.map((a, i) => {
            const isUnlocked = unlockedIds.has(a.id);
            const t = TIER_STYLE[a.tier];
            return (
              <div key={a.id} className="badge-card" style={{
                background: isUnlocked
                  ? `linear-gradient(135deg, ${t.bg} 0%, rgba(10,10,15,0.9) 100%)`
                  : "var(--bg-card)",
                backdropFilter: "blur(16px)",
                border: `1px solid ${isUnlocked ? t.bdr : "var(--bdr)"}`,
                borderRadius: "var(--r-lg)",
                padding: "20px 18px",
                transition: "transform .25s ease, box-shadow .25s ease",
                boxShadow: isUnlocked ? `0 4px 20px ${t.glow}` : "none",
                opacity: isUnlocked ? 1 : 0.45,
                animation: mounted ? `popIn .4s ${i * 0.04}s ease both` : "none",
                position: "relative", overflow: "hidden",
              }}>
                {/* Tier glow orb */}
                {isUnlocked && (
                  <div aria-hidden style={{
                    position: "absolute", top: -20, right: -20,
                    width: 80, height: 80, borderRadius: "50%",
                    background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`,
                    animation: "glow 3s ease infinite",
                  }} />
                )}

                {/* Icon */}
                <div className="badge-icon" style={{
                  fontSize: 32, marginBottom: 12, display: "block",
                  filter: isUnlocked ? "none" : "grayscale(1) opacity(.4)",
                }}>
                  {isUnlocked ? a.icon : "🔒"}
                </div>

                {/* Tier chip */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{
                    fontFamily: "var(--sans)", fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: isUnlocked ? t.color : "var(--text-3)",
                    padding: "2px 8px", borderRadius: 99,
                    background: isUnlocked ? t.bg : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isUnlocked ? t.bdr : "var(--bdr)"}`,
                  }}>
                    {a.tier}
                  </span>
                </div>

                <h4 style={{
                  fontFamily: "var(--serif)", fontSize: "1rem", fontWeight: 400,
                  color: isUnlocked ? "var(--text)" : "var(--text-3)",
                  margin: "0 0 6px",
                }}>
                  {a.label}
                </h4>
                <p style={{
                  fontFamily: "var(--sans)", fontSize: 12, fontWeight: 300,
                  color: isUnlocked ? "var(--text-2)" : "var(--text-3)",
                  lineHeight: 1.5, margin: 0,
                }}>
                  {a.desc}
                </p>

                {/* Unlocked checkmark */}
                {isUnlocked && (
                  <div style={{
                    position: "absolute", top: 14, right: 14,
                    width: 20, height: 20, borderRadius: "50%",
                    background: t.color, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: "#0A0A0F", fontWeight: 700,
                  }}>✓</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}