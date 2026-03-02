import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { getGoals, addGoal, updateGoal, deleteGoal } from "../services/goalsService";

const ICONS = ["🎯","✈️","🏠","🚗","💻","📱","🎓","💍","🏋️","🌴","🎸","⛵"];
const EMPTY = { name:"", target:"", saved:"", icon:"🎯", deadline:"" };

export default function Goals() {
  const [goals, setGoals]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(EMPTY);
  const [showForm, setShow]   = useState(false);
  const [editId, setEditId]   = useState(null);
  const [addAmt, setAddAmt]   = useState({});
  const [toast, setToast]     = useState(null);

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    try {
      const res = await getGoals();
      setGoals(res.data);
    } catch {
      showToast("err", "Failed to load goals.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    if (!form.name || !form.target) return;
    const payload = {
      name: form.name, target: Number(form.target),
      saved: Number(form.saved) || 0, icon: form.icon,
      deadline: form.deadline || null,
    };
    try {
      if (editId) {
        const res = await updateGoal(editId, payload);
        setGoals(gs => gs.map(g => g._id === editId ? res.data : g));
        showToast("ok", `✅ "${form.name}" updated.`);
      } else {
        const res = await addGoal(payload);
        setGoals(gs => [...gs, res.data]);
        showToast("ok", `🎯 Goal "${form.name}" created!`);
      }
      setForm(EMPTY); setShow(false); setEditId(null);
    } catch {
      showToast("err", "Failed to save goal.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    try {
      await deleteGoal(id);
      setGoals(gs => gs.filter(g => g._id !== id));
    } catch {
      showToast("err", "Failed to delete.");
    }
  };

  const handleEdit = (g) => {
    setForm({ name: g.name, target: g.target, saved: g.saved, icon: g.icon, deadline: g.deadline ? g.deadline.slice(0, 10) : "" });
    setEditId(g._id); setShow(true);
  };

  const handleAdd = async (id) => {
    const amt = Number(addAmt[id]);
    if (!amt || amt <= 0) return;
    const goal = goals.find(g => g._id === id);
    const newSaved = Math.min(goal.saved + amt, goal.target);
    try {
      const res = await updateGoal(id, { saved: newSaved });
      setGoals(gs => gs.map(g => g._id === id ? res.data : g));
      setAddAmt(a => ({ ...a, [id]: "" }));
    } catch {
      showToast("err", "Failed to update savings.");
    }
  };

  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved  = goals.reduce((s, g) => s + g.saved, 0);
  const done        = goals.filter(g => g.saved >= g.target).length;

  const TOAST_S = {
    ok:  { bdr:"rgba(74,222,128,.25)",  bg:"rgba(74,222,128,.08)",  color:"var(--ok)"  },
    err: { bdr:"rgba(248,113,113,.25)", bg:"rgba(248,113,113,.08)", color:"var(--err)" },
  };

  const inp = {
    fontFamily:"var(--sans)", fontSize:14, fontWeight:300, color:"var(--text)",
    background:"rgba(255,255,255,0.03)", border:"1px solid var(--bdr)",
    borderRadius:"var(--r-md)", padding:"11px 14px", outline:"none", width:"100%",
    transition:"border-color .2s, box-shadow .2s", boxSizing:"border-box",
  };

  if (loading) return (
    <Layout title="Savings Goals">
      <div className="card" style={{ textAlign:"center", padding:"64px 24px" }}>
        <p style={{ fontFamily:"var(--sans)", fontSize:14, color:"var(--text-3)" }}>Loading goals…</p>
      </div>
    </Layout>
  );

  return (
    <Layout title="Savings Goals">
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {toast && (() => { const s = TOAST_S[toast.type]; return (
        <div style={{ position:"relative", overflow:"hidden", borderRadius:"var(--r-lg)", border:`1px solid ${s.bdr}`, background:s.bg, animation:"slideDown .3s ease both" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 18px 11px" }}>
            <p style={{ flex:1, fontFamily:"var(--sans)", fontSize:13, color:s.color }}>{toast.msg}</p>
            <button onClick={() => setToast(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-3)", fontSize:20 }}>×</button>
          </div>
        </div>
      );})()}

      {/* Summary */}
      {goals.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, border:"1px solid var(--bdr)", borderRadius:"var(--r-xl)", overflow:"hidden", background:"var(--bdr)" }}>
          {[
            { label:"Total Goals",  value: goals.length },
            { label:"Completed",    value: done },
            { label:"Total Saved",  value:`₹${totalSaved.toLocaleString()}` },
            { label:"Total Target", value:`₹${totalTarget.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background:"var(--bg-card)", padding:"20px" }}>
              <div style={{ fontFamily:"var(--serif)", fontSize:"1.5rem", color:"var(--accent)", lineHeight:1, marginBottom:6 }}>{value}</div>
              <div className="label">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button onClick={() => { setShow(s => !s); setEditId(null); setForm(EMPTY); }} className={showForm ? "btn-ghost" : "btn-primary"} style={{ padding:"10px 24px" }}>
          {showForm ? "Cancel" : "+ New Goal"}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ animation:"slideDown .25s ease both" }}>
          <p className="label" style={{ marginBottom:4, color:"var(--accent)", opacity:.7 }}>{editId ? "Edit" : "New"} Goal</p>
          <h3 style={{ fontFamily:"var(--serif)", fontSize:"1.3rem", fontWeight:400, color:"var(--text)", marginBottom:22 }}>
            {editId ? "Update your goal" : "Set a new savings goal"}
          </h3>
          <div style={{ marginBottom:18 }}>
            <label className="label" style={{ display:"block", marginBottom:10 }}>Icon</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {ICONS.map(icon => (
                <button key={icon} type="button" onClick={() => setForm(f => ({ ...f, icon }))}
                  style={{ width:40, height:40, borderRadius:"var(--r-sm)", fontSize:18, cursor:"pointer", background:form.icon === icon ? "var(--accent-bg)" : "rgba(255,255,255,0.03)", border:`1px solid ${form.icon === icon ? "var(--accent-bdr)" : "var(--bdr)"}`, transition:"all .15s" }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
            {[
              { label:"Goal Name",          key:"name",     type:"text",   ph:"e.g. Europe Trip" },
              { label:"Target (₹)",         key:"target",   type:"number", ph:"50000" },
              { label:"Already Saved (₹)",  key:"saved",    type:"number", ph:"0" },
              { label:"Deadline (optional)",key:"deadline", type:"date",   ph:"" },
            ].map(({ label, key, type, ph }) => (
              <div key={key} style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <label className="label">{label}</label>
                <input type={type} style={{ ...inp, colorScheme: type === "date" ? "dark" : undefined }}
                  placeholder={ph} value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  onFocus={el => { el.target.style.borderColor="var(--accent-bdr)"; el.target.style.boxShadow="0 0 0 3px var(--accent-bg)"; }}
                  onBlur={el  => { el.target.style.borderColor="var(--bdr)"; el.target.style.boxShadow="none"; }}
                />
              </div>
            ))}
          </div>
          <button onClick={handleSave} className="btn-primary" style={{ width:"100%", padding:13 }}>
            {editId ? "Update Goal" : "Create Goal"}
          </button>
        </div>
      )}

      {goals.length === 0 && !showForm ? (
        <div className="card" style={{ textAlign:"center", padding:"64px 24px" }}>
          <div style={{ fontSize:48, marginBottom:14 }}>🎯</div>
          <p style={{ fontFamily:"var(--sans)", fontSize:14, fontWeight:300, color:"var(--text-2)", marginBottom:6 }}>No savings goals yet</p>
          <p style={{ fontFamily:"var(--sans)", fontSize:12, color:"var(--text-3)" }}>Click "+ New Goal" to set your first target</p>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {goals.map(goal => {
            const pct      = Math.min(100, Math.round(goal.saved / goal.target * 100));
            const isDone   = pct >= 100;
            const left     = goal.target - goal.saved;
            const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / 86400000) : null;
            return (
              <div key={goal._id} className="card" style={{ borderColor:isDone ? "rgba(94,234,212,.3)" : "var(--bdr)", padding:"22px 24px", transition:"border-color .2s" }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:42, height:42, borderRadius:10, background:"var(--accent-bg)", border:"1px solid var(--accent-bdr)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{goal.icon}</div>
                    <div>
                      <h4 style={{ fontFamily:"var(--sans)", fontSize:14, fontWeight:500, color:"var(--text)", margin:0 }}>{goal.name}</h4>
                      {daysLeft !== null && (
                        <p style={{ fontFamily:"var(--sans)", fontSize:11, margin:"2px 0 0", color:daysLeft < 0 ? "var(--err)" : daysLeft <= 30 ? "var(--warn)" : "var(--text-3)" }}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today!" : `${daysLeft}d left`}
                        </p>
                      )}
                    </div>
                  </div>
                  {isDone && <span style={{ fontFamily:"var(--sans)", fontSize:10, fontWeight:600, padding:"3px 10px", borderRadius:99, background:"var(--accent-bg)", border:"1px solid var(--accent-bdr)", color:"var(--accent)" }}>✓ Done</span>}
                </div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontFamily:"var(--serif)", fontSize:"1rem", color:"var(--accent)" }}>₹{goal.saved.toLocaleString()}</span>
                    <span style={{ fontFamily:"var(--sans)", fontSize:12, color:"var(--text-3)" }}>of ₹{goal.target.toLocaleString()}</span>
                  </div>
                  <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden", marginBottom:6 }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:isDone ? "var(--accent)" : "linear-gradient(90deg,var(--accent),#2DD4BF)", borderRadius:99, transition:"width .6s ease" }} />
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontFamily:"var(--sans)", fontSize:11, color:"var(--text-3)" }}>{pct}% complete</span>
                    {!isDone && <span style={{ fontFamily:"var(--sans)", fontSize:11, color:"var(--text-3)" }}>₹{left.toLocaleString()} to go</span>}
                  </div>
                </div>
                {!isDone && (
                  <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                    <input type="number" placeholder="Add ₹ savings"
                      value={addAmt[goal._id] || ""}
                      onChange={e => setAddAmt(a => ({ ...a, [goal._id]: e.target.value }))}
                      style={{ flex:1, fontFamily:"var(--sans)", fontSize:13, fontWeight:300, color:"var(--text)", background:"rgba(255,255,255,0.03)", border:"1px solid var(--bdr)", borderRadius:"var(--r-md)", padding:"9px 12px", outline:"none" }}
                      onFocus={el => el.target.style.borderColor="var(--accent-bdr)"}
                      onBlur={el  => el.target.style.borderColor="var(--bdr)"}
                    />
                    <button onClick={() => handleAdd(goal._id)} className="btn-primary" style={{ padding:"9px 16px", fontSize:13 }}>Add</button>
                  </div>
                )}
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => handleEdit(goal)} className="btn-ghost" style={{ flex:1, padding:"8px", fontSize:12 }}>Edit</button>
                  <button onClick={() => handleDelete(goal._id)}
                    style={{ flex:1, padding:"8px", fontSize:12, fontFamily:"var(--sans)", cursor:"pointer", background:"transparent", border:"1px solid rgba(248,113,113,.2)", borderRadius:"var(--r-md)", color:"var(--err)", transition:"background .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--err-bg)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}