import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addExpense } from "../services/expenseService";
import { getBudgets } from "../services/budgetService";
import Layout from "../components/Layout";

const CATS        = ["Food", "Travel", "Shopping", "Bills", "Other"];
const PRESET_TAGS = ["essential", "leisure", "work", "health", "family", "subscription"];

const CAT_META = {
  Food:     { icon: "🍽️", color: "#FB923C" },
  Travel:   { icon: "✈️", color: "#60A5FA" },
  Shopping: { icon: "🛍️", color: "#C084FC" },
  Bills:    { icon: "📄", color: "#F87171" },
  Other:    { icon: "📦", color: "#94A3B8" },
};

export default function AddExpense() {
  const navigate = useNavigate();

  const [title, setTitle]         = useState("");
  const [amount, setAmount]       = useState("");
  const [category, setCategory]   = useState("Food");
  const [notes, setNotes]         = useState("");
  const [tags, setTags]           = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [loading, setLoading]     = useState(false);
  const [toast, setToast]         = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  };

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
        showToast("err",  `⚠️ Budget exceeded! You're ₹${Math.abs(budget.remaining)} over your ₹${budget.amount} ${category} limit.`);
      else if (budget.remaining <= budget.amount * 0.2)
        showToast("warn", `🔔 Only ₹${budget.remaining} left of ₹${budget.amount} ${category} budget.`);
      else
        showToast("ok",   `✅ ₹${amount} added to ${category}. ₹${budget.remaining} of ₹${budget.amount} remaining.`);

      setTitle(""); setAmount(""); setCategory("Food");
      setNotes(""); setTags([]);

    } catch {
      showToast("err", "❌ Failed to add expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const TOAST_S = {
    ok:   { bdr: "rgba(74,222,128,.25)",  bg: "rgba(74,222,128,.08)",  color: "var(--ok)"   },
    warn: { bdr: "rgba(251,191,36,.25)",  bg: "rgba(251,191,36,.08)",  color: "var(--warn)"  },
    err:  { bdr: "rgba(248,113,113,.25)", bg: "rgba(248,113,113,.08)", color: "var(--err)"   },
  };

  const inp = {
    fontFamily: "var(--sans)", fontSize: 14, fontWeight: 300,
    color: "var(--text)", background: "rgba(255,255,255,0.03)",
    border: "1px solid var(--bdr)", borderRadius: "var(--r-md)",
    padding: "12px 14px", outline: "none", width: "100%",
    transition: "border-color .2s, box-shadow .2s",
  };

  return (
    <Layout title="Add Expense">
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* Toast */}
        {toast && (() => {
          const s = TOAST_S[toast.type];
          return (
            <div style={{
              position: "relative", overflow: "hidden",
              borderRadius: "var(--r-lg)",
              border: `1px solid ${s.bdr}`, background: s.bg,
              marginBottom: 8,
              animation: "slideDown .3s ease both",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, height: 2,
                background: s.color,
                animation: "shrinkBar 5s linear forwards",
              }} />
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 18px 12px" }}>
                <p style={{ flex: 1, fontFamily: "var(--sans)", fontSize: 13, fontWeight: 300, color: s.color, lineHeight: 1.5 }}>
                  {toast.msg}
                </p>
                <button onClick={() => setToast(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 20, lineHeight: 1 }}>
                  ×
                </button>
              </div>
            </div>
          );
        })()}

        {/* Main card */}
        <div className="card" style={{ padding: "36px 40px" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <p className="label" style={{ marginBottom: 6, color: "var(--accent)", opacity: 0.7 }}>New Entry</p>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 400, color: "var(--text)", margin: 0 }}>
              Add Expense
            </h2>
            <p style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 300, color: "var(--text-2)", marginTop: 6 }}>
              Fill in the details below to log a new expense.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>

            {/* Title */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label className="label">Expense Title</label>
              <input
                className="input-field"
                placeholder="e.g. Dinner at restaurant, Uber ride…"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Amount + Category side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label className="label">Amount (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label className="label">Category</label>
                <select
                  className="input-field"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {CATS.map(c => (
                    <option key={c} value={c} style={{ background: "var(--bg-elevated)" }}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category visual indicator */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px",
              borderRadius: "var(--r-md)",
              background: `${CAT_META[category]?.color}12`,
              border: `1px solid ${CAT_META[category]?.color}28`,
            }}>
              <span style={{ fontSize: 22 }}>{CAT_META[category]?.icon}</span>
              <div>
                <p style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 500, color: CAT_META[category]?.color }}>
                  {category}
                </p>
                <p style={{ fontFamily: "var(--sans)", fontSize: 11, fontWeight: 300, color: "var(--text-3)", marginTop: 1 }}>
                  Selected category
                </p>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "var(--bdr)" }} />

            {/* Notes */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label className="label">Notes <span style={{ fontWeight: 300, letterSpacing: 0, textTransform: "none", fontSize: 11, color: "var(--text-3)" }}>(optional)</span></label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Any extra context about this expense…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ resize: "none" }}
              />
            </div>

            {/* Tags */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label className="label">Tags <span style={{ fontWeight: 300, letterSpacing: 0, textTransform: "none", fontSize: 11, color: "var(--text-3)" }}>(optional)</span></label>

              {/* Preset tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {PRESET_TAGS.map(t => (
                  <button type="button" key={t} onClick={() => toggleTag(t)}
                    style={{
                      fontFamily: "var(--sans)", fontSize: 12, fontWeight: 400,
                      padding: "5px 14px", borderRadius: 99, cursor: "pointer",
                      border: `1px solid ${tags.includes(t) ? "var(--accent-bdr)" : "var(--bdr)"}`,
                      background: tags.includes(t) ? "var(--accent-bg)" : "transparent",
                      color: tags.includes(t) ? "var(--accent)" : "var(--text-3)",
                      transition: "all .15s",
                    }}>
                    #{t}
                  </button>
                ))}
              </div>

              {/* Custom tag */}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  placeholder="Add custom tag…"
                  value={customTag}
                  onChange={e => setCustomTag(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustom())}
                  className="input-field"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={addCustom} className="btn-ghost" style={{ padding: "10px 18px", whiteSpace: "nowrap" }}>
                  + Add
                </button>
              </div>

              {/* Selected tags */}
              {tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {tags.map(t => (
                    <span key={t} style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      fontFamily: "var(--sans)", fontSize: 11, fontWeight: 400,
                      padding: "4px 12px", borderRadius: 99,
                      background: "var(--accent-bg)", border: "1px solid var(--accent-bdr)",
                      color: "var(--accent)",
                    }}>
                      #{t}
                      <button type="button" onClick={() => setTags(ts => ts.filter(x => x !== t))}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 15, lineHeight: 1, padding: 0 }}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "var(--bdr)" }} />

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="btn-primary" disabled={loading}
                style={{ flex: 1, padding: "14px", fontSize: 14 }}>
                {loading ? "Adding…" : "Add Expense"}
              </button>
              <button type="button" onClick={() => navigate("/dashboard")} className="btn-ghost"
                style={{ padding: "14px 24px", fontSize: 14 }}>
                Cancel
              </button>
            </div>

          </form>
        </div>

        {/* Quick links */}
        <div style={{
          marginTop: 16,
          display: "flex", justifyContent: "center", gap: 24,
        }}>
          <button onClick={() => navigate("/dashboard")}
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 13, color: "var(--text-3)" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}
          >
            ← Back to Dashboard
          </button>
          <button onClick={() => navigate("/budgets")}
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 13, color: "var(--text-3)" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}
          >
            View Budgets →
          </button>
        </div>

      </div>
    </Layout>
  );
}