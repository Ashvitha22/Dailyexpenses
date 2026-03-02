import { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import { getIncome, addIncome, updateIncome, deleteIncome } from "../services/incomeService";
import { getExpenses } from "../services/expenseService";

const INCOME_CATS = [
  { id:"salary",     label:"Salary",           icon:"💼", color:"#4ADE80" },
  { id:"freelance",  label:"Freelance",         icon:"💻", color:"#60A5FA" },
  { id:"business",   label:"Business",          icon:"🏢", color:"#F59E0B" },
  { id:"investment", label:"Investment Return",  icon:"📈", color:"#A78BFA" },
  { id:"rental",     label:"Rental Income",     icon:"🏠", color:"#2DD4BF" },
  { id:"gift",       label:"Gift / Bonus",      icon:"🎁", color:"#FB923C" },
  { id:"other",      label:"Other",             icon:"💰", color:"#94A3B8" },
];

const FREQ = ["one-time","daily","weekly","monthly","yearly"];
const EMPTY_FORM = { label:"", amount:"", category:"", frequency:"monthly", note:"", date:new Date().toISOString().slice(0,10) };
const fmtINR = (n) => { const a=Math.abs(n); if(a>=10000000) return `₹${(n/10000000).toFixed(2)}Cr`; if(a>=100000) return `₹${(n/100000).toFixed(2)}L`; return `₹${Number(n).toLocaleString("en-IN")}`; };

export default function Income() {
  const [entries, setEntries]     = useState([]);
  const [expenses, setExpenses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editId, setEditId]       = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [mounted, setMounted]     = useState(false);
  const [toast, setToast]         = useState(null);
  const [filterCat, setFilterCat] = useState("all");
  const [sortBy, setSortBy]       = useState("date");

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [ir, er] = await Promise.all([getIncome(), getExpenses()]);
      setEntries(ir.data);
      setExpenses(er.data);
    } catch {
      showToast("Failed to load data.", "warn");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };

  const totalIncome   = useMemo(() => entries.reduce((s, e) => s + Number(e.amount), 0), [entries]);
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount || 0), 0), [expenses]);
  const balance       = totalIncome - totalExpenses;
  const isPositive    = balance >= 0;
  const spentPct      = totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0;

  const byCategory = useMemo(() =>
    INCOME_CATS.map(cat => ({
      ...cat,
      total: entries.filter(e => e.category === cat.id).reduce((s, e) => s + Number(e.amount), 0),
      count: entries.filter(e => e.category === cat.id).length,
    })).filter(c => c.total > 0),
    [entries]
  );

  const displayed = useMemo(() => {
    const list = filterCat === "all" ? entries : entries.filter(e => e.category === filterCat);
    return [...list].sort((a, b) => sortBy === "amount" ? Number(b.amount) - Number(a.amount) : new Date(b.date) - new Date(a.date));
  }, [entries, filterCat, sortBy]);

  const handleSave = async () => {
    if (!form.label.trim() || !form.amount || !form.category) return;
    const payload = { ...form, amount: Number(form.amount) };
    try {
      if (editId) {
        const res = await updateIncome(editId, payload);
        setEntries(es => es.map(e => e._id === editId ? res.data : e));
        showToast("Income updated.");
      } else {
        const res = await addIncome(payload);
        setEntries(es => [...es, res.data]);
        showToast("Income added successfully.");
      }
      setForm(EMPTY_FORM); setEditId(null); setShowForm(false);
    } catch {
      showToast("Failed to save income.", "warn");
    }
  };

  const handleEdit = (entry) => {
    setForm({ label:entry.label, amount:String(entry.amount), category:entry.category, frequency:entry.frequency, note:entry.note || "", date:entry.date ? entry.date.slice(0,10) : new Date().toISOString().slice(0,10) });
    setEditId(entry._id); setShowForm(true);
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await deleteIncome(id);
      setEntries(es => es.filter(e => e._id !== id));
      showToast("Entry deleted.", "warn");
    } catch {
      showToast("Failed to delete.", "warn");
    }
  };

  const getCat = (id) => INCOME_CATS.find(c => c.id === id) || INCOME_CATS[INCOME_CATS.length - 1];

  return (
    <Layout title="Income">
      <style>{`
        @keyframes floatUp  {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn    {from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
        @keyframes countUp  {from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .inc-row:hover{background:rgba(255,255,255,0.025)!important}
        .inc-row:hover .inc-actions{opacity:1!important}
        .inc-actions{opacity:0;transition:opacity .2s}
        .inc-inp{font-family:var(--sans);font-size:14px;font-weight:300;color:var(--text);background:rgba(255,255,255,0.03);border:1px solid var(--bdr);border-radius:var(--r-md);padding:11px 14px;outline:none;width:100%;box-sizing:border-box;transition:border-color .2s,box-shadow .2s}
        .inc-inp:focus{border-color:var(--accent-bdr);box-shadow:0 0 0 3px var(--accent-bg)}
        .inc-inp option{background:#16161F}
        .cat-chip{transition:all .15s ease}.cat-chip:hover{opacity:1!important}
        .freq-btn{transition:all .15s ease}.freq-btn:hover{background:rgba(255,255,255,0.06)!important}
      `}</style>

      {toast && (
        <div style={{ position:"fixed", bottom:28, right:28, zIndex:999, padding:"13px 20px", background:"var(--bg-elevated)", border:`1px solid ${toast.type==="ok"?"rgba(74,222,128,.3)":"rgba(251,191,36,.3)"}`, borderLeft:`3px solid ${toast.type==="ok"?"var(--ok)":"var(--warn)"}`, borderRadius:"var(--r-md)", boxShadow:"var(--shadow-lg)", fontFamily:"var(--sans)", fontSize:13, color:toast.type==="ok"?"var(--ok)":"var(--warn)", animation:"slideDown .3s ease both", display:"flex", alignItems:"center", gap:8 }}>
          <span>{toast.type === "ok" ? "✓" : "⚠"}</span> {toast.msg}
        </div>
      )}

      {/* Hero cards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:1, borderRadius:"var(--r-xl)", overflow:"hidden", background:"var(--bdr)", border:"1px solid var(--bdr)", opacity:mounted?1:0, animation:mounted?"floatUp .5s ease both":"none" }}>
        {[
          { top:"Total Income",  main:fmtINR(totalIncome),        sub:`${entries.length} entries`,              icon:"💰", color:"#4ADE80" },
          { top:"Total Spent",   main:fmtINR(totalExpenses),       sub:`${spentPct.toFixed(1)}% of income`,     icon:"📤", color:"#F87171" },
          { top:"Balance Left",  main:fmtINR(Math.abs(balance)),   sub:isPositive?"Remaining":"Over budget",    icon:isPositive?"✅":"⚠️", color:isPositive?"#4ADE80":"#F87171" },
        ].map(({ top, main, sub, icon, color }, i) => (
          <div key={top} style={{ background:"var(--bg-card)", backdropFilter:"blur(16px)", padding:"26px 28px", position:"relative", overflow:"hidden", animation:mounted?`floatUp .5s ${i*0.08}s ease both`:"none" }}>
            <div style={{ position:"absolute", top:14, right:16, fontSize:22, opacity:.22 }}>{icon}</div>
            <p className="label" style={{ marginBottom:10, color:"var(--text-3)" }}>{top}</p>
            <p style={{ fontFamily:"var(--serif)", fontSize:"2.2rem", lineHeight:1, color, marginBottom:6, animation:mounted?`countUp .6s ${i*0.1+0.2}s ease both`:"none", opacity:mounted?1:0 }}>{main}</p>
            <p style={{ fontFamily:"var(--sans)", fontSize:12, color:"var(--text-3)", fontWeight:300 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Budget bar */}
      {totalIncome > 0 && (
        <div className="card" style={{ opacity:mounted?1:0, animation:mounted?"floatUp .5s .1s ease both":"none" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:14 }}>
            <div>
              <p className="label" style={{ color:"var(--accent)", opacity:.7, marginBottom:3 }}>Budget Usage</p>
              <h3 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:400, color:"var(--text)", margin:0 }}>Income vs Expenses</h3>
            </div>
            <span style={{ fontFamily:"var(--serif)", fontSize:"1.6rem", color:spentPct>=100?"#F87171":spentPct>=80?"#FB923C":"#4ADE80" }}>{spentPct.toFixed(0)}%</span>
          </div>
          <div style={{ height:10, background:"rgba(255,255,255,0.05)", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${spentPct}%`, background:spentPct>=100?"linear-gradient(90deg,#F87171,#F43F5E)":spentPct>=80?"linear-gradient(90deg,#FB923C,#F59E0B)":"linear-gradient(90deg,var(--accent),#2DD4BF)", borderRadius:99, transition:"width 1s ease" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
            <span style={{ fontFamily:"var(--sans)", fontSize:11, color:"#F87171" }}>Spent: {fmtINR(totalExpenses)}</span>
            <span style={{ fontFamily:"var(--sans)", fontSize:11, color:isPositive?"#4ADE80":"#F87171" }}>{isPositive ? `Remaining: ${fmtINR(balance)}` : `Over by: ${fmtINR(Math.abs(balance))}`}</span>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div className="card" style={{ opacity:mounted?1:0, animation:mounted?"floatUp .5s .15s ease both":"none" }}>
          <p className="label" style={{ color:"var(--accent)", opacity:.7, marginBottom:3 }}>Breakdown</p>
          <h3 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:400, color:"var(--text)", marginBottom:18 }}>Income by Category</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {byCategory.map(cat => {
              const pct = totalIncome > 0 ? (cat.total / totalIncome) * 100 : 0;
              return (
                <div key={cat.id}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:14 }}>{cat.icon}</span>
                      <span style={{ fontFamily:"var(--sans)", fontSize:12, color:"var(--text-2)" }}>{cat.label}</span>
                      <span style={{ fontFamily:"var(--sans)", fontSize:10, color:"var(--text-3)" }}>({cat.count})</span>
                    </div>
                    <span style={{ fontFamily:"var(--serif)", fontSize:"0.95rem", color:cat.color }}>{fmtINR(cat.total)}</span>
                  </div>
                  <div style={{ height:4, background:"rgba(255,255,255,0.05)", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:cat.color, borderRadius:99, transition:"width .8s ease", opacity:0.8 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add button */}
      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button onClick={() => { setShowForm(s => !s); if (showForm) { setForm(EMPTY_FORM); setEditId(null); } }} className={showForm && !editId ? "btn-ghost" : "btn-primary"} style={{ padding:"10px 24px" }}>
          {showForm && !editId ? "Cancel" : "+ Add Income"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ animation:"floatUp .25s ease both" }}>
          <p className="label" style={{ marginBottom:4, color:"var(--accent)", opacity:.7 }}>{editId ? "Edit" : "New"} Entry</p>
          <h3 style={{ fontFamily:"var(--serif)", fontSize:"1.2rem", fontWeight:400, color:"var(--text)", marginBottom:22 }}>{editId ? "Update income entry" : "Log your income"}</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}><label className="label">Income Name</label><input className="inc-inp" placeholder="e.g. November Salary" value={form.label} onChange={e => setForm(f => ({ ...f, label:e.target.value }))} /></div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}><label className="label">Amount (₹)</label><input className="inc-inp" type="number" placeholder="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount:e.target.value }))} /></div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}><label className="label">Category</label><select className="inc-inp" value={form.category} onChange={e => setForm(f => ({ ...f, category:e.target.value }))}><option value="">Select category</option>{INCOME_CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select></div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}><label className="label">Date</label><input className="inc-inp" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date:e.target.value }))} /></div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:14 }}>
            <label className="label">Frequency</label>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {FREQ.map(f => (
                <button key={f} type="button" className="freq-btn" onClick={() => setForm(frm => ({ ...frm, frequency:f }))}
                  style={{ fontFamily:"var(--sans)", fontSize:11, fontWeight:form.frequency===f?600:400, padding:"6px 14px", borderRadius:99, cursor:"pointer", background:form.frequency===f?"var(--accent-bg)":"rgba(255,255,255,0.04)", border:`1px solid ${form.frequency===f?"var(--accent-bdr)":"var(--bdr)"}`, color:form.frequency===f?"var(--accent)":"var(--text-3)", textTransform:"capitalize" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:20 }}>
            <label className="label">Note <span style={{ textTransform:"none", letterSpacing:0, fontWeight:300, fontSize:11, color:"var(--text-3)" }}>(optional)</span></label>
            <input className="inc-inp" placeholder="Any extra detail…" value={form.note} onChange={e => setForm(f => ({ ...f, note:e.target.value }))} />
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={handleSave} className="btn-primary" style={{ padding:"11px 28px", fontSize:13 }}>{editId ? "Update Entry" : "Add Income"}</button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setEditId(null); }} className="btn-ghost" style={{ padding:"11px 20px", fontSize:13 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ opacity:mounted?1:0, animation:mounted?"floatUp .5s .2s ease both":"none" }}>
        {entries.length > 0 ? (
          <>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, flexWrap:"wrap" }}>
              <p className="label" style={{ color:"var(--text-3)", marginRight:4 }}>Filter:</p>
              {[{ id:"all", label:`All (${entries.length})`, icon:"💰" }, ...INCOME_CATS.filter(c => entries.some(e => e.category === c.id))].map(cat => (
                <button key={cat.id} className="cat-chip" onClick={() => setFilterCat(cat.id)}
                  style={{ fontFamily:"var(--sans)", fontSize:11, fontWeight:filterCat===cat.id?600:400, padding:"5px 13px", borderRadius:99, cursor:"pointer", background:filterCat===cat.id?"var(--accent-bg)":"transparent", border:`1px solid ${filterCat===cat.id?"var(--accent-bdr)":"var(--bdr)"}`, color:filterCat===cat.id?"var(--accent)":"var(--text-3)", opacity:filterCat===cat.id?1:0.65 }}>
                  {cat.icon} {cat.label}
                </button>
              ))}
              <div style={{ marginLeft:"auto", display:"flex", gap:6, alignItems:"center" }}>
                <p className="label" style={{ color:"var(--text-3)" }}>Sort:</p>
                {["date","amount"].map(s => (
                  <button key={s} className="cat-chip" onClick={() => setSortBy(s)}
                    style={{ fontFamily:"var(--sans)", fontSize:11, fontWeight:sortBy===s?600:400, padding:"5px 13px", borderRadius:99, cursor:"pointer", background:sortBy===s?"var(--accent-bg)":"transparent", border:`1px solid ${sortBy===s?"var(--accent-bdr)":"var(--bdr)"}`, color:sortBy===s?"var(--accent)":"var(--text-3)", opacity:sortBy===s?1:0.65, textTransform:"capitalize" }}>
                    {s === "date" ? "🗓 Date" : "💲 Amount"}
                  </button>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding:0, overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr auto", padding:"12px 22px", gap:12, borderBottom:"1px solid var(--bdr)", background:"rgba(255,255,255,0.02)" }}>
                {["Name","Category","Frequency","Amount",""].map((h, i) => <span key={i} className="label" style={{ color:"var(--text-3)", fontSize:10 }}>{h}</span>)}
              </div>
              {displayed.map((entry, i) => {
                const cat = getCat(entry.category);
                return (
                  <div key={entry._id} className="inc-row" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr auto", alignItems:"center", gap:12, padding:"14px 22px", borderBottom:i<displayed.length-1?"1px solid var(--bdr)":"none", transition:"background .15s", cursor:"default", animation:`popIn .3s ${i*0.03}s ease both` }}>
                    <div>
                      <p style={{ fontFamily:"var(--sans)", fontSize:13, fontWeight:400, color:"var(--text)", margin:0 }}>{entry.label}</p>
                      <p style={{ fontFamily:"var(--sans)", fontSize:10, color:"var(--text-3)", margin:"2px 0 0", fontWeight:300 }}>{new Date(entry.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}{entry.note ? ` • ${entry.note}` : ""}</p>
                    </div>
                    <div><span style={{ fontFamily:"var(--sans)", fontSize:10, fontWeight:600, padding:"3px 10px", borderRadius:99, background:`${cat.color}15`, border:`1px solid ${cat.color}30`, color:cat.color, whiteSpace:"nowrap" }}>{cat.icon} {cat.label}</span></div>
                    <span style={{ fontFamily:"var(--sans)", fontSize:11, color:"var(--text-3)", textTransform:"capitalize" }}>{entry.frequency || "one-time"}</span>
                    <span style={{ fontFamily:"var(--serif)", fontSize:"1rem", color:"#4ADE80", fontWeight:400 }}>+{fmtINR(Number(entry.amount))}</span>
                    <div className="inc-actions" style={{ display:"flex", gap:6 }}>
                      <button onClick={() => handleEdit(entry)} className="btn-ghost" style={{ padding:"4px 12px", fontSize:11 }}>Edit</button>
                      <button onClick={() => handleDelete(entry._id)} style={{ padding:"4px 12px", fontSize:11, fontFamily:"var(--sans)", cursor:"pointer", background:"var(--err-bg)", border:"1px solid rgba(248,113,113,.2)", borderRadius:"var(--r-md)", color:"var(--err)", transition:"background .15s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(248,113,113,.18)"} onMouseLeave={e => e.currentTarget.style.background="var(--err-bg)"}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="card" style={{ textAlign:"center", padding:"64px 24px" }}>
            <div style={{ fontSize:48, marginBottom:14 }}>💰</div>
            <p style={{ fontFamily:"var(--sans)", fontSize:14, fontWeight:300, color:"var(--text-2)", marginBottom:6 }}>No income entries yet</p>
            <p style={{ fontFamily:"var(--sans)", fontSize:12, color:"var(--text-3)", marginBottom:20 }}>Add your income sources to track your balance against expenses</p>
            <button onClick={() => setShowForm(true)} className="btn-primary" style={{ padding:"10px 24px" }}>+ Add Your First Income</button>
          </div>
        )}
      </div>
    </Layout>
  );
}