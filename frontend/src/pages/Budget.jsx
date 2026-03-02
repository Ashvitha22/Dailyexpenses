import { useEffect, useState } from "react";
import { getBudgets, setBudget } from "../services/budgetService";
import Layout from "../components/Layout";

const CAT_META = {
  Food:     { icon: "🍽️", color: "#FB923C", bg: "rgba(251,146,60,.10)",  bdr: "rgba(251,146,60,.22)"  },
  Travel:   { icon: "✈️",  color: "#60A5FA", bg: "rgba(96,165,250,.10)",  bdr: "rgba(96,165,250,.22)"  },
  Shopping: { icon: "🛍️", color: "#C084FC", bg: "rgba(192,132,252,.10)", bdr: "rgba(192,132,252,.22)" },
  Bills:    { icon: "📄", color: "#F87171", bg: "rgba(248,113,113,.10)", bdr: "rgba(248,113,113,.22)" },
  Other:    { icon: "📦", color: "#94A3B8", bg: "rgba(148,163,184,.10)", bdr: "rgba(148,163,184,.22)" },
};
const CATS = Object.keys(CAT_META);

export default function Budget() {
  const [budgets, setBudgets]   = useState([]);
  const [category, setCategory] = useState("Food");
  const [amount, setAmount]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  const load = async () => {
    try { setLoading(true); const r = await getBudgets(); setBudgets(r.data); }
    catch(e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const handleSet = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await setBudget({ category, amount: Number(amount) });
      setAmount("");
      showToast("ok", `✅ Budget for ${category} set to ₹${Number(amount).toLocaleString()}`);
      load();
    } catch { showToast("err", "❌ Failed to set budget."); }
    finally { setSaving(false); }
  };

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent  = budgets.reduce((s, b) => s + (b.spent || 0), 0);

  const TOAST_S = {
    ok:  { bdr: "rgba(74,222,128,.25)", bg: "rgba(74,222,128,.08)", color: "var(--ok)" },
    err: { bdr: "rgba(248,113,113,.25)", bg: "rgba(248,113,113,.08)", color: "var(--err)" },
  };

  return (
    <Layout title="Budget Management">

      {/* Toast */}
      {toast && (() => { const s = TOAST_S[toast.type]; return (
        <div style={{ position:"relative", overflow:"hidden", borderRadius:"var(--r-lg)", border:`1px solid ${s.bdr}`, background: s.bg, animation:"slideDown .3s ease both" }}>
          <div style={{ position:"absolute", top:0, left:0, height:2, background: s.color, animation:"shrinkBar 4s linear forwards" }} />
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 18px 11px" }}>
            <p style={{ flex:1, fontFamily:"var(--sans)", fontSize:13, fontWeight:300, color: s.color }}>{toast.msg}</p>
            <button onClick={() => setToast(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-3)", fontSize:20, lineHeight:1 }}>×</button>
          </div>
        </div>
      );})()}

      {/* Summary strip */}
      {budgets.length > 0 && (
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(3,1fr)",
          border:"1px solid var(--bdr)", borderRadius:"var(--r-xl)", overflow:"hidden",
          background:"var(--bg-card)", backdropFilter:"blur(16px)",
        }}>
          {[
            { label:"Total Budget",  value:`₹${totalBudget.toLocaleString()}` },
            { label:"Total Spent",   value:`₹${totalSpent.toLocaleString()}`  },
            { label:"Remaining",     value:`₹${(totalBudget - totalSpent).toLocaleString()}` },
          ].map(({ label, value }, i) => (
            <div key={label} style={{ padding:"22px 24px", borderRight: i < 2 ? "1px solid var(--bdr)" : "none" }}>
              <div style={{ fontFamily:"var(--serif)", fontSize:"1.7rem", color:"var(--accent)", lineHeight:1, marginBottom:6 }}>{value}</div>
              <div className="label">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Set budget form */}
      <div className="card">
        <p className="label" style={{ marginBottom:4, color:"var(--accent)", opacity:.7 }}>Configure</p>
        <h3 style={{ fontFamily:"var(--serif)", fontSize:"1.3rem", fontWeight:400, color:"var(--text)", marginBottom:20 }}>
          Set a Budget
        </h3>
        <form onSubmit={handleSet} style={{ display:"flex", flexWrap:"wrap", gap:12, alignItems:"flex-end" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:8, minWidth:160 }}>
            <label className="label">Category</label>
            <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}
              style={{ width:"100%" }}>
              {CATS.map(c => <option key={c} value={c} style={{ background:"var(--bg-elevated)" }}>{CAT_META[c].icon} {c}</option>)}
            </select>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1, minWidth:180 }}>
            <label className="label">Monthly Limit (₹)</label>
            <input type="number" className="input-field" placeholder="e.g. 5000"
              value={amount} onChange={e => setAmount(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}
            style={{ padding:"11px 28px", whiteSpace:"nowrap" }}>
            {saving ? "Saving…" : "Set Budget"}
          </button>
        </form>
      </div>

      {/* Budget cards */}
      <div>
        <p className="label" style={{ marginBottom:14, color:"var(--accent)", opacity:.7 }}>Overview</p>
        <h3 style={{ fontFamily:"var(--serif)", fontSize:"1.3rem", fontWeight:400, color:"var(--text)", marginBottom:20 }}>
          Your Budgets
        </h3>

        {loading ? (
          <div style={{ textAlign:"center", padding:40, fontFamily:"var(--sans)", fontSize:12, color:"var(--text-3)", letterSpacing:"0.12em", textTransform:"uppercase", animation:"blink 1.6s infinite" }}>
            Loading…
          </div>
        ) : budgets.length === 0 ? (
          <div className="card" style={{ textAlign:"center", padding:"48px 24px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>💰</div>
            <p style={{ fontFamily:"var(--sans)", fontSize:14, fontWeight:300, color:"var(--text-2)", marginBottom:6 }}>No budgets set yet</p>
            <p style={{ fontFamily:"var(--sans)", fontSize:12, color:"var(--text-3)" }}>Use the form above to set your first budget</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px,1fr))", gap:16 }}>
            {budgets.map(b => {
              const pct  = Math.min(100, Math.round((b.spent / b.amount) * 100));
              const meta = CAT_META[b.category] || CAT_META.Other;
              const over = b.remaining <= 0;
              const warn = !over && pct >= 80;

              return (
                <div key={b._id} className="card" style={{
                  borderColor: over ? "rgba(248,113,113,.25)" : warn ? "rgba(251,191,36,.2)" : "var(--bdr)",
                  padding: "22px 24px",
                }}>
                  {/* Header */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:40, height:40, borderRadius:10, background: meta.bg, border:`1px solid ${meta.bdr}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                        {meta.icon}
                      </div>
                      <div>
                        <h4 style={{ fontFamily:"var(--sans)", fontSize:14, fontWeight:500, color:"var(--text)", margin:0 }}>{b.category}</h4>
                        <p style={{ fontFamily:"var(--sans)", fontSize:11, color:"var(--text-3)", margin:0 }}>Monthly budget</p>
                      </div>
                    </div>
                    {over && (
                      <span style={{ fontFamily:"var(--sans)", fontSize:10, fontWeight:600, padding:"3px 10px", borderRadius:99, background:"var(--err-bg)", border:"1px solid rgba(248,113,113,.25)", color:"var(--err)" }}>
                        Exceeded
                      </span>
                    )}
                    {warn && !over && (
                      <span style={{ fontFamily:"var(--sans)", fontSize:10, fontWeight:600, padding:"3px 10px", borderRadius:99, background:"var(--warn-bg)", border:"1px solid rgba(251,191,36,.25)", color:"var(--warn)" }}>
                        Almost full
                      </span>
                    )}
                  </div>

                  {/* Amounts */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
                    <span style={{ fontFamily:"var(--serif)", fontSize:"1.4rem", color: over ? "var(--err)" : "var(--accent)" }}>
                      ₹{(b.spent || 0).toLocaleString()}
                    </span>
                    <span style={{ fontFamily:"var(--sans)", fontSize:12, color:"var(--text-3)" }}>
                      of ₹{b.amount.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden", marginBottom:10 }}>
                    <div style={{
                      height:"100%",
                      width:`${pct}%`,
                      borderRadius:99,
                      background: over ? "var(--err)" : warn ? "var(--warn)" : meta.color,
                      transition:"width .7s ease",
                    }} />
                  </div>

                  {/* Footer */}
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontFamily:"var(--sans)", fontSize:12, color: over ? "var(--err)" : "var(--text-3)" }}>
                      {over ? `₹${Math.abs(b.remaining).toLocaleString()} over limit` : `₹${b.remaining.toLocaleString()} remaining`}
                    </span>
                    <span style={{ fontFamily:"var(--sans)", fontSize:12, color:"var(--text-3)" }}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}