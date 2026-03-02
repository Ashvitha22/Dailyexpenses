import { useState, useMemo } from "react";
import { deleteExpense, updateExpense } from "../services/expenseService";

const CAT_COLOR = {
  Food:     { color: "#FB923C", bg: "rgba(251,146,60,.10)",  bdr: "rgba(251,146,60,.22)"  },
  Travel:   { color: "#60A5FA", bg: "rgba(96,165,250,.10)",  bdr: "rgba(96,165,250,.22)"  },
  Shopping: { color: "#C084FC", bg: "rgba(192,132,252,.10)", bdr: "rgba(192,132,252,.22)" },
  Bills:    { color: "#F87171", bg: "rgba(248,113,113,.10)", bdr: "rgba(248,113,113,.22)" },
  Other:    { color: "#94A3B8", bg: "rgba(148,163,184,.10)", bdr: "rgba(148,163,184,.22)" },
};

const SORTS = [
  { value: "date_desc",   label: "Newest first"  },
  { value: "date_asc",    label: "Oldest first"  },
  { value: "amount_desc", label: "Highest amount"},
  { value: "amount_asc",  label: "Lowest amount" },
  { value: "title_asc",   label: "Title A → Z"   },
];

const CATS = ["Food","Travel","Shopping","Bills","Other"];

export default function ExpenseList({ expenses = [], refresh }) {
  const [editId, setEditId]     = useState(null);
  const [editData, setEditData] = useState({ title: "", amount: "", category: "Food", notes: "" });
  const [search, setSearch]     = useState("");
  const [sort, setSort]         = useState("date_desc");
  const [expanded, setExpanded] = useState({});

  const startEdit = e => { setEditId(e._id); setEditData({ title: e.title, amount: e.amount, category: e.category, notes: e.notes || "" }); };
  const saveEdit  = async id => {
    try { await updateExpense(id, { ...editData, amount: Number(editData.amount) }); setEditId(null); refresh(); }
    catch { alert("Update failed"); }
  };
  const del = async id => {
    if (!window.confirm("Delete this expense?")) return;
    await deleteExpense(id); refresh();
  };

  const filtered = useMemo(() => {
    let list = [...expenses];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.notes || "").toLowerCase().includes(q) ||
        (e.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    switch (sort) {
      case "date_desc":   list.sort((a,b) => new Date(b.date||b.createdAt)-new Date(a.date||a.createdAt)); break;
      case "date_asc":    list.sort((a,b) => new Date(a.date||a.createdAt)-new Date(b.date||b.createdAt)); break;
      case "amount_desc": list.sort((a,b) => b.amount-a.amount); break;
      case "amount_asc":  list.sort((a,b) => a.amount-b.amount); break;
      case "title_asc":   list.sort((a,b) => a.title.localeCompare(b.title)); break;
    }
    return list;
  }, [expenses, search, sort]);

  const inp = {
    fontFamily: "var(--sans)", fontSize: 13, fontWeight: 300,
    color: "var(--text)", background: "rgba(255,255,255,0.03)",
    border: "1px solid var(--bdr)", borderRadius: "var(--r-md)",
    padding: "9px 12px", outline: "none",
  };

  return (
    <div className="card">
      <p className="label" style={{ marginBottom: 4, color: "var(--accent)", opacity: 0.7 }}>Records</p>
      <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", fontWeight: 400, color: "var(--text)", marginBottom: 18 }}>
        Expense List
      </h3>

      {/* Search + Sort */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", fontSize: 13 }}>🔍</span>
          <input placeholder="Search title, category, notes, tags…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inp, width: "100%", paddingLeft: 32 }} />
          {search && (
            <button onClick={() => setSearch("")}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 18, lineHeight: 1 }}>
              ×
            </button>
          )}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ ...inp, minWidth: 150 }}>
          {SORTS.map(o => <option key={o.value} value={o.value} style={{ background: "var(--bg-elevated)" }}>{o.label}</option>)}
        </select>
      </div>

      {search && (
        <p style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--text-3)", marginBottom: 12 }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
        </p>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>{search ? "🔎" : "📭"}</div>
          <p style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {search ? "No matching expenses" : "No expenses yet"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filtered.map(exp => {
            const c = CAT_COLOR[exp.category] || CAT_COLOR.Other;
            const isEdit = editId === exp._id;
            return (
              <div key={exp._id}
                style={{
                  borderRadius: "var(--r-md)", overflow: "hidden",
                  transition: "background .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px" }}>

                  {isEdit ? (
                    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <input style={{ ...inp, width: "100%" }} value={editData.title} placeholder="Title"
                        onChange={e => setEditData({...editData, title: e.target.value})} />
                      <input type="number" style={{ ...inp, width: "100%" }} value={editData.amount}
                        onChange={e => setEditData({...editData, amount: e.target.value})} />
                      <select style={{ ...inp, width: "100%" }} value={editData.category}
                        onChange={e => setEditData({...editData, category: e.target.value})}>
                        {CATS.map(c => <option key={c} style={{ background: "var(--bg-elevated)" }}>{c}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      {/* Category badge */}
                      <span style={{
                        fontFamily: "var(--sans)", fontSize: 10, fontWeight: 600,
                        letterSpacing: "0.06em", textTransform: "uppercase",
                        padding: "3px 9px", borderRadius: 99,
                        color: c.color, background: c.bg, border: `1px solid ${c.bdr}`,
                        whiteSpace: "nowrap", flexShrink: 0,
                      }}>{exp.category}</span>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 400, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {exp.title}
                          </span>
                          {(exp.tags || []).map(t => (
                            <span key={t} style={{
                              fontFamily: "var(--sans)", fontSize: 10,
                              padding: "1px 7px", borderRadius: 99,
                              background: "var(--accent-bg)", border: "1px solid var(--accent-bdr)",
                              color: "var(--accent)", flexShrink: 0,
                            }}>#{t}</span>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 2 }}>
                          {(exp.date || exp.createdAt) && (
                            <span style={{ fontFamily: "var(--sans)", fontSize: 11, color: "var(--text-3)" }}>
                              {new Date(exp.date || exp.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          )}
                          {exp.notes && (
                            <button onClick={() => setExpanded(x => ({...x, [exp._id]: !x[exp._id]}))}
                              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 11, color: "var(--accent)", opacity: 0.6, padding: 0 }}>
                              {expanded[exp._id] ? "▲ hide" : "▼ note"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Amount */}
                  {!isEdit && (
                    <span style={{ fontFamily: "var(--serif)", fontSize: "1rem", color: "var(--accent)", flexShrink: 0 }}>
                      ₹{exp.amount.toLocaleString()}
                    </span>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {isEdit ? (
                      <>
                        <button onClick={() => saveEdit(exp._id)} className="btn-primary" style={{ padding: "6px 14px", fontSize: 12 }}>Save</button>
                        <button onClick={() => setEditId(null)} className="btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(exp)} className="btn-ghost"
                          style={{ padding: "6px 12px", fontSize: 12, opacity: 0, transition: "opacity .15s" }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                          onFocus={e => e.currentTarget.style.opacity = 1}
                          ref={el => el && el.closest("div[style]")?.addEventListener("mouseenter", () => el.style.opacity = 1)}
                        >Edit</button>
                        <button onClick={() => del(exp._id)}
                          style={{
                            padding: "6px 12px", fontSize: 12,
                            fontFamily: "var(--sans)", cursor: "pointer",
                            background: "transparent", border: "1px solid rgba(248,113,113,.18)",
                            borderRadius: "var(--r-md)", color: "var(--err)", opacity: 0,
                            transition: "opacity .15s, background .15s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = "var(--err-bg)"; }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = 0; e.currentTarget.style.background = "transparent"; }}
                        >Delete</button>
                      </>
                    )}
                  </div>
                </div>

                {/* Note expand */}
                {exp.notes && expanded[exp._id] && (
                  <div style={{ padding: "0 12px 10px" }}>
                    <div style={{
                      background: "rgba(255,255,255,0.025)", border: "1px solid var(--bdr)",
                      borderRadius: "var(--r-sm)", padding: "10px 14px",
                    }}>
                      <p style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--text-2)", fontWeight: 300, lineHeight: 1.6 }}>
                        💬 {exp.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}