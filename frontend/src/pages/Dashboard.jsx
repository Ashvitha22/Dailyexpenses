import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseList   from "../components/ExpenseList";
import FilterBar     from "../components/FilterBar";
import MonthlySummary from "../components/MonthlySummary";
import InsightsPanel  from "../components/InsightsPanel";
import { getExpenses } from "../services/expenseService";
import { getBudgets }  from "../services/budgetService";
import Layout from "../components/Layout";

export default function Dashboard() {
  const navigate = useNavigate();
  const [expenses, setExpenses]   = useState([]);
  const [budgets, setBudgets]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [dismissed, setDismissed] = useState([]);

  const loadExpenses = async (params = {}) => {
    try { setLoading(true); const r = await getExpenses(params); setExpenses(r.data); }
    catch(e) { console.error(e); } finally { setLoading(false); }
  };
  const loadBudgets = async () => {
    try { const r = await getBudgets(); setBudgets(r.data); } catch(e) { console.error(e); }
  };

  useEffect(() => { loadExpenses(); loadBudgets(); }, []);
  const refresh = () => { loadExpenses(); loadBudgets(); };

  const alerts = budgets
    .filter(b => !dismissed.includes(b._id))
    .map(b => {
      const pct = Math.round((b.spent / b.amount) * 100);
      if (b.remaining <= 0)
        return { id: b._id, type: "err",  icon: "⚠️", pct, msg: `${b.category} budget exceeded! ₹${b.spent?.toLocaleString()} spent of ₹${b.amount?.toLocaleString()}.` };
      if (pct >= 80)
        return { id: b._id, type: "warn", icon: "🔔", pct, msg: `${b.category} is ${pct}% used — only ₹${b.remaining?.toLocaleString()} of ₹${b.amount?.toLocaleString()} left.` };
      return null;
    }).filter(Boolean);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const cats  = [...new Set(expenses.map(e => e.category))].length;

  return (
    <Layout title="Dashboard">

      {/* ── Budget Alert Banners ── */}
      {alerts.map(a => (
        <div key={a.id} style={{
          position: "relative", overflow: "hidden",
          borderRadius: "var(--r-lg)",
          border: `1px solid ${a.type === "err" ? "rgba(248,113,113,0.25)" : "rgba(251,191,36,0.25)"}`,
          background: a.type === "err" ? "var(--err-bg)" : "var(--warn-bg)",
          animation: "slideDown .3s ease both",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: "rgba(255,255,255,0.06)",
          }}>
            <div style={{
              height: "100%", width: `${Math.min(a.pct, 100)}%`,
              background: a.type === "err" ? "var(--err)" : "var(--warn)",
            }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px 12px" }}>
            <span style={{ fontSize: 18 }}>{a.icon}</span>
            <p style={{ flex: 1, fontFamily: "var(--sans)", fontSize: 13, fontWeight: 300, color: a.type === "err" ? "var(--err)" : "var(--warn)", lineHeight: 1.5 }}>
              {a.msg}
            </p>
            <button onClick={() => setDismissed(d => [...d, a.id])}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 20, lineHeight: 1, padding: "0 4px" }}>
              ×
            </button>
          </div>
        </div>
      ))}

      {/* ── Summary Stats + Quick Add ── */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 16, flexWrap: "wrap" }}>

        {/* Stats grid */}
        <div style={{
          flex: 1, minWidth: 280,
          display: "grid", gridTemplateColumns: "repeat(3,1fr)",
          border: "1px solid var(--bdr)", borderRadius: "var(--r-xl)", overflow: "hidden",
          background: "var(--bg-card)", backdropFilter: "blur(16px)",
        }}>
          {[
            { label: "Total Spent",  value: `₹${total.toLocaleString()}`  },
            { label: "Entries",      value: expenses.length },
            { label: "Categories",   value: cats },
          ].map(({ label, value }, i) => (
            <div key={label} style={{
              padding: "24px 20px",
              borderRight: i < 2 ? "1px solid var(--bdr)" : "none",
            }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", color: "var(--accent)", lineHeight: 1, marginBottom: 6 }}>
                {value}
              </div>
              <div className="label">{label}</div>
            </div>
          ))}
        </div>

        {/* Quick add card */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 10, padding: "24px 32px",
          background: "var(--bg-card)", backdropFilter: "blur(16px)",
          border: "1px solid var(--bdr)", borderRadius: "var(--r-xl)",
          cursor: "pointer", transition: "border-color .2s, background .2s",
          minWidth: 180,
        }}
          onClick={() => navigate("/add-expense")}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-bdr)"; e.currentTarget.style.background = "rgba(94,234,212,0.04)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--bdr)"; e.currentTarget.style.background = "var(--bg-card)"; }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "var(--accent-bg)", border: "1px solid var(--accent-bdr)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, color: "var(--accent)",
            transition: "background .2s",
          }}>+</div>
          <p style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 500, color: "var(--accent)", margin: 0 }}>
            Add Expense
          </p>
          <p style={{ fontFamily: "var(--sans)", fontSize: 11, fontWeight: 300, color: "var(--text-3)", margin: 0, textAlign: "center" }}>
            Log a new entry
          </p>
        </div>

      </div>

      <FilterBar onFilter={loadExpenses} />
      <InsightsPanel expenses={expenses} budgets={budgets} />

      {loading ? (
        <div style={{
          textAlign: "center", padding: "48px",
          fontFamily: "var(--sans)", fontSize: 12,
          color: "var(--text-3)", letterSpacing: "0.14em",
          textTransform: "uppercase", animation: "blink 1.6s infinite",
        }}>
          Loading expenses…
        </div>
      ) : (
        <>
          <ExpenseList expenses={expenses} refresh={refresh} />
          <MonthlySummary expenses={expenses} />
        </>
      )}

    </Layout>
  );
}