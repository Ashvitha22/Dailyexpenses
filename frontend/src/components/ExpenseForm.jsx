import { useState } from "react";
import { addExpense } from "../services/expenseService";
import { getBudgets } from "../services/budgetService";

const PRESET_TAGS = ["essential","leisure","work","health","family","subscription"];
const CATS        = ["Food","Travel","Shopping","Bills","Other"];

export default function ExpenseForm({ refresh }) {
  const [title, setTitle]       = useState("");
  const [amount, setAmount]     = useState("");
  const [category, setCategory] = useState("Food");
  const [notes, setNotes]       = useState("");
  const [tags, setTags]         = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 5000); };

  const toggleTag = t => setTags(ts => ts.includes(t) ? ts.filter(x => x !== t) : [...ts, t]);
  const addCustom = () => {
    const t = customTag.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(ts => [...ts, t]);
    setCustomTag("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      await addExpense({ title, amount: Number(amount), category, notes, tags });
      const res    = await getBudgets();
      const budget = res.data.find(b => b.category.toLowerCase() === category.toLowerCase());
      if (!budget)
        showToast("ok",   `✅ ₹${amount} added under ${category}. No budget set.`);
      else if (budget.remaining <= 0)
        showToast("err",  `⚠️ You spent ₹${amount} on ${category}. Budget exceeded by ₹${Math.abs(budget.remaining)}!`);
      else if (budget.remaining <= budget.amount * 0.2)
        showToast("warn", `🔔 You spent ₹${amount} on ${category}. Only ₹${budget.remaining} left of ₹${budget.amount}.`);
      else
        showToast("ok",   `✅ ₹${amount} added to ${category}. Remaining: ₹${budget.remaining} of ₹${budget.amount}.`);
      setTitle(""); setAmount(""); setCategory("Food"); setNotes(""); setTags([]); setExpanded(false);
      if (refresh) refresh();
    } catch { showToast("err", "❌ Failed to add expense."); }
    finally { setLoading(false); }
  };

  const inp = {
    fontFamily: "var(--sans)", fontSize: 13, fontWeight: 300,
    color: "var(--text)", background: "rgba(255,255,255,0.03)",
    border: "1px solid var(--bdr)", borderRadius: "var(--r-md)",
    padding: "10px 14px", outline: "none", width: "100%",
  };

  const TOAST_STYLE = {
    ok:   { border: "rgba(74,222,128,0.25)",  bg: "var(--ok-bg)",   color: "var(--ok)"   },
    warn: { border: "rgba(251,191,36,0.25)",  bg: "var(--warn-bg)", color: "var(--warn)"  },
    err:  { border: "rgba(248,113,113,0.25)", bg: "var(--err-bg)",  color: "var(--err)"   },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Toast */}
      {toast && (() => { const s = TOAST_STYLE[toast.type]; return (
        <div style={{
          position: "relative", overflow: "hidden",
          borderRadius: "var(--r-lg)",
          border: `1px solid ${s.border}`, background: s.bg,
          animation: "slideDown .3s ease both",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, height: 2, background: s.color,
            animation: "shrinkBar 5s linear forwards",
          }} />
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 18px 12px" }}>
            <p style={{ flex: 1, fontFamily: "var(--sans)", fontSize: 13, fontWeight: 300, color: s.color, lineHeight: 1.5 }}>
              {toast.msg}
            </p>
            <button onClick={() => setToast(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 20, lineHeight: 1 }}>×</button>
          </div>
        </div>
      );})()}

      {/* Form card */}
      <div className="card">
        <p className="label" style={{ marginBottom: 4, color: "var(--accent)", opacity: 0.7 }}>New Entry</p>
        <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", fontWeight: 400, color: "var(--text)", marginBottom: 20 }}>
          Add Expense
        </h3>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Title + Amount */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="label">Title</label>
              <input className="input-field" placeholder="e.g. Dinner, Uber" value={title}
                onChange={e => setTitle(e.target.value)} required />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="label">Amount (₹)</label>
              <input type="number" className="input-field" placeholder="0.00" value={amount}
                onChange={e => setAmount(e.target.value)} required />
            </div>
          </div>

          {/* Category */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className="label">Category</label>
            <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
              {CATS.map(c => <option key={c} style={{ background: "var(--bg-elevated)" }}>{c}</option>)}
            </select>
          </div>

          {/* Notes/tags toggle */}
          <button type="button" onClick={() => setExpanded(x => !x)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "var(--sans)", fontSize: 12, fontWeight: 400,
              color: "var(--accent)", opacity: 0.7,
              textAlign: "left", padding: 0,
              letterSpacing: "0.04em",
            }}>
            {expanded ? "▲ Hide" : "▼ Add"} notes & tags
          </button>

          {expanded && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="label">Notes</label>
                <textarea className="input-field" rows={2} placeholder="Extra details…"
                  value={notes} onChange={e => setNotes(e.target.value)}
                  style={{ resize: "none" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label className="label">Tags</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {PRESET_TAGS.map(t => (
                    <button type="button" key={t} onClick={() => toggleTag(t)}
                      style={{
                        fontFamily: "var(--sans)", fontSize: 11, fontWeight: 500,
                        padding: "4px 12px", borderRadius: 99,
                        border: `1px solid ${tags.includes(t) ? "var(--accent-bdr)" : "var(--bdr)"}`,
                        background: tags.includes(t) ? "var(--accent-bg)" : "transparent",
                        color: tags.includes(t) ? "var(--accent)" : "var(--text-3)",
                        cursor: "pointer", transition: "all .15s",
                      }}>
                      #{t}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input placeholder="Custom tag…" value={customTag}
                    onChange={e => setCustomTag(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustom())}
                    style={{ ...inp, flex: 1 }} />
                  <button type="button" onClick={addCustom} className="btn-ghost" style={{ padding: "9px 16px", fontSize: 12 }}>
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {tags.map(t => (
                      <span key={t} style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontFamily: "var(--sans)", fontSize: 11,
                        padding: "3px 10px", borderRadius: 99,
                        background: "var(--accent-bg)", border: "1px solid var(--accent-bdr)",
                        color: "var(--accent)",
                      }}>
                        #{t}
                        <button type="button" onClick={() => setTags(ts => ts.filter(x => x !== t))}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width: "100%", padding: "13px", fontSize: 13, marginTop: 4 }}>
            {loading ? "Adding…" : "Add Expense"}
          </button>
        </form>
      </div>
    </div>
  );
}