import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { getNetWorth, addNetWorthItem, updateNetWorthItem, deleteNetWorthItem } from "../services/netWorthService";

const ASSET_CATS = [
  { id:"cash",       label:"Cash & Savings",   icon:"💵", color:"#4ADE80" },
  { id:"investment", label:"Investments",       icon:"📈", color:"#60A5FA" },
  { id:"property",   label:"Property",          icon:"🏠", color:"#F59E0B" },
  { id:"vehicle",    label:"Vehicle",           icon:"🚗", color:"#A78BFA" },
  { id:"other_a",    label:"Other Assets",      icon:"📦", color:"#94A3B8" },
];
const LIAB_CATS = [
  { id:"loan",       label:"Loans",             icon:"🏦", color:"#F87171" },
  { id:"credit",     label:"Credit Card",       icon:"💳", color:"#FB923C" },
  { id:"mortgage",   label:"Mortgage",          icon:"🏗️", color:"#F43F5E" },
  { id:"other_l",    label:"Other Liabilities", icon:"📋", color:"#94A3B8" },
];

const EMPTY_ITEM = { label:"", amount:"", category:"", type:"asset", note:"" };
const fmtINR = (n) => { const a=Math.abs(n); if(a>=10000000) return `₹${(n/10000000).toFixed(2)}Cr`; if(a>=100000) return `₹${(n/100000).toFixed(2)}L`; return `₹${Number(n).toLocaleString("en-IN")}`; };

export default function NetWorth() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_ITEM);
  const [editId, setEditId]     = useState(null);
  const [tab, setTab]           = useState("assets");
  const [mounted, setMounted]   = useState(false);
  const [toast, setToast]       = useState(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await getNetWorth();
      setItems(res.data);
    } catch {
      showToast("Failed to load net worth data.", "warn");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const assets      = items.filter(i => i.type === "asset");
  const liabilities = items.filter(i => i.type === "liability");
  const totalAssets = assets.reduce((s, i) => s + Number(i.amount), 0);
  const totalLiabs  = liabilities.reduce((s, i) => s + Number(i.amount), 0);
  const netWorth    = totalAssets - totalLiabs;
  const isPositive  = netWorth >= 0;

  const grouped = (itemList, cats) => cats.map(cat => ({
    ...cat,
    items: itemList.filter(i => i.category === cat.id),
    total: itemList.filter(i => i.category === cat.id).reduce((s, i) => s + Number(i.amount), 0),
  })).filter(g => g.items.length > 0);

  const handleSave = async () => {
    if (!form.label.trim() || !form.amount || !form.category) return;
    const payload = { ...form, amount: Number(form.amount) };
    try {
      if (editId) {
        const res = await updateNetWorthItem(editId, payload);
        setItems(is => is.map(i => i._id === editId ? res.data : i));
        showToast("Entry updated.");
      } else {
        const res = await addNetWorthItem(payload);
        setItems(is => [...is, res.data]);
        showToast("Entry added successfully.");
      }
      setForm(EMPTY_ITEM); setEditId(null); setShowForm(false);
    } catch {
      showToast("Failed to save entry.", "warn");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNetWorthItem(id);
      setItems(is => is.filter(i => i._id !== id));
      showToast("Entry deleted.", "warn");
    } catch {
      showToast("Failed to delete.", "warn");
    }
  };

  const handleEdit = (item) => {
    setForm({ label:item.label, amount:String(item.amount), category:item.category, type:item.type, note:item.note || "" });
    setEditId(item._id); setTab(item.type === "asset" ? "assets" : "liabilities");
    setShowForm(true); window.scrollTo({ top:0, behavior:"smooth" });
  };

  const currentItems = tab === "assets" ? assets : liabilities;
  const currentTotal = tab === "assets" ? totalAssets : totalLiabs;
  const groupedItems = grouped(currentItems, tab === "assets" ? ASSET_CATS : LIAB_CATS);
  const netWorthColor = isPositive ? "#4ADE80" : "#F87171";

  if (loading) return (
    <Layout title="Net Worth">
      <div className="card" style={{ textAlign:"center", padding:"64px 24px" }}>
        <p style={{ fontFamily:"var(--sans)", fontSize:14, color:"var(--text-3)" }}>Loading net worth…</p>
      </div>
    </Layout>
  );

  return (
    <Layout title="Net Worth">
      <style>{`
        @keyframes floatUp   {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes countUp   {from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glowPulse {0%,100%{opacity:.5}50%{opacity:1}}
        .nw-row:hover{background:rgba(255,255,255,0.025)!important}
        .nw-row:hover .nw-actions{opacity:1!important}
        .nw-actions{opacity:0;transition:opacity .2s}
        .nw-inp{font-family:var(--sans);font-size:14px;font-weight:300;color:var(--text);background:rgba(255,255,255,0.03);border:1px solid var(--bdr);border-radius:var(--r-md);padding:11px 14px;outline:none;width:100%;transition:border-color .2s,box-shadow .2s}
        .nw-inp:focus{border-color:var(--accent-bdr);box-shadow:0 0 0 3px var(--accent-bg)}
        .nw-inp option{background:#16161F}
        .tab-btn{transition:all .18s}
      `}</style>

      {toast && (
        <div style={{ position:"fixed", bottom:28, right:28, zIndex:999, padding:"13px 20px", background:"var(--bg-elevated)", border:`1px solid ${toast.type==="ok"?"rgba(74,222,128,.3)":"rgba(251,191,36,.3)"}`, borderLeft:`3px solid ${toast.type==="ok"?"var(--ok)":"var(--warn)"}`, borderRadius:"var(--r-md)", boxShadow:"var(--shadow-lg)", fontFamily:"var(--sans)", fontSize:13, color:toast.type==="ok"?"var(--ok)":"var(--warn)", animation:"floatUp .3s ease both", display:"flex", alignItems:"center", gap:8 }}>
          <span>{toast.type === "ok" ? "✓" : "⚠"}</span> {toast.msg}
        </div>
      )}

      {/* Hero */}
      <div style={{ position:"relative", overflow:"hidden", background:"var(--bg-card)", backdropFilter:"blur(20px)", border:"1px solid var(--bdr)", borderRadius:"var(--r-xl)", padding:"40px 40px 36px", opacity:mounted?1:0, animation:mounted?"floatUp .5s ease both":"none" }}>
        <div aria-hidden style={{ position:"absolute", top:-80, right:-80, width:320, height:320, borderRadius:"50%", background:`radial-gradient(circle, ${isPositive?"rgba(74,222,128,0.07)":"rgba(248,113,113,0.07)"} 0%, transparent 70%)`, animation:"glowPulse 4s ease infinite" }} />
        <div aria-hidden style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg, transparent, ${netWorthColor}, transparent)`, opacity:0.4 }} />

        <p className="label" style={{ marginBottom:6, color:"var(--text-3)" }}>Total Net Worth</p>
        <div style={{ display:"flex", alignItems:"baseline", gap:14, marginBottom:28, flexWrap:"wrap" }}>
          <h2 style={{ fontFamily:"var(--serif)", fontSize:"clamp(2.4rem,5vw,3.6rem)", fontWeight:400, color:netWorthColor, margin:0, letterSpacing:"-0.03em", lineHeight:1, animation:mounted?"countUp .7s .1s ease both":"none", opacity:mounted?1:0 }}>
            {fmtINR(netWorth)}
          </h2>
          <span style={{ fontFamily:"var(--sans)", fontSize:13, fontWeight:500, padding:"4px 12px", borderRadius:99, background:isPositive?"rgba(74,222,128,0.1)":"rgba(248,113,113,0.1)", border:`1px solid ${isPositive?"rgba(74,222,128,0.25)":"rgba(248,113,113,0.25)"}`, color:netWorthColor }}>
            {isPositive ? "▲ Positive" : "▼ Negative"}
          </span>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, maxWidth:480 }}>
          {[
            { label:"Total Assets",      value:totalAssets, color:"#4ADE80", icon:"📈" },
            { label:"Total Liabilities", value:totalLiabs,  color:"#F87171", icon:"📉" },
          ].map(({ label, value, color, icon }) => (
            <div key={label} style={{ padding:"16px 18px", background:"rgba(255,255,255,0.03)", border:"1px solid var(--bdr)", borderRadius:"var(--r-lg)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ fontSize:14 }}>{icon}</span>
                <span className="label" style={{ color:"var(--text-3)" }}>{label}</span>
              </div>
              <p style={{ fontFamily:"var(--serif)", fontSize:"1.5rem", color, margin:0, lineHeight:1 }}>{fmtINR(value)}</p>
            </div>
          ))}
        </div>

        {(totalAssets + totalLiabs) > 0 && (
          <div style={{ marginTop:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontFamily:"var(--sans)", fontSize:11, color:"#4ADE80" }}>Assets {Math.round(totalAssets/(totalAssets+totalLiabs)*100)}%</span>
              <span style={{ fontFamily:"var(--sans)", fontSize:11, color:"#F87171" }}>Liabilities {Math.round(totalLiabs/(totalAssets+totalLiabs)*100)}%</span>
            </div>
            <div style={{ height:6, borderRadius:99, overflow:"hidden", background:"rgba(248,113,113,0.3)" }}>
              <div style={{ height:"100%", width:`${Math.round(totalAssets/(totalAssets+totalLiabs)*100)}%`, background:"linear-gradient(90deg,#4ADE80,#2DD4BF)", borderRadius:99, transition:"width .8s ease" }} />
            </div>
          </div>
        )}
      </div>

      {/* Add button */}
      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button onClick={() => { setShowForm(s => !s); if (showForm) { setForm(EMPTY_ITEM); setEditId(null); } }} className={showForm && !editId ? "btn-ghost" : "btn-primary"} style={{ padding:"10px 24px" }}>
          {showForm && !editId ? "Cancel" : "+ Add Entry"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ animation:"floatUp .25s ease both" }}>
          <p className="label" style={{ marginBottom:4, color:"var(--accent)", opacity:.7 }}>{editId ? "Edit" : "New"} Entry</p>
          <h3 style={{ fontFamily:"var(--serif)", fontSize:"1.2rem", fontWeight:400, color:"var(--text)", marginBottom:20 }}>{editId ? "Update your entry" : "Add an asset or liability"}</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              <label className="label">Type</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                {["asset","liability"].map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type:t, category:"" }))}
                    style={{ fontFamily:"var(--sans)", fontSize:12, fontWeight:form.type===t?600:400, padding:"9px 0", borderRadius:"var(--r-md)", cursor:"pointer", background:form.type===t?(t==="asset"?"rgba(74,222,128,0.15)":"rgba(248,113,113,0.15)"):"rgba(255,255,255,0.03)", color:form.type===t?(t==="asset"?"#4ADE80":"#F87171"):"var(--text-3)", border:`1px solid ${form.type===t?(t==="asset"?"rgba(74,222,128,0.3)":"rgba(248,113,113,0.3)"):"var(--bdr)"}`, transition:"all .15s", textTransform:"capitalize" }}>
                    {t === "asset" ? "📈 Asset" : "📉 Liability"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              <label className="label">Category</label>
              <select className="nw-inp" value={form.category} onChange={e => setForm(f => ({ ...f, category:e.target.value }))}>
                <option value="">Select category</option>
                {(form.type === "asset" ? ASSET_CATS : LIAB_CATS).map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              <label className="label">Name</label>
              <input className="nw-inp" placeholder={form.type === "asset" ? "e.g. SBI Savings Account" : "e.g. Home Loan"} value={form.label} onChange={e => setForm(f => ({ ...f, label:e.target.value }))} />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              <label className="label">Amount (₹)</label>
              <input className="nw-inp" type="number" placeholder="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount:e.target.value }))} />
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:18 }}>
            <label className="label">Note <span style={{ textTransform:"none", letterSpacing:0, fontWeight:300, fontSize:11, color:"var(--text-3)" }}>(optional)</span></label>
            <input className="nw-inp" placeholder="Any extra detail…" value={form.note} onChange={e => setForm(f => ({ ...f, note:e.target.value }))} />
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={handleSave} className="btn-primary" style={{ padding:"11px 28px", fontSize:13 }}>{editId ? "Update Entry" : "Add Entry"}</button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_ITEM); setEditId(null); }} className="btn-ghost" style={{ padding:"11px 20px", fontSize:13 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      {items.length === 0 ? (
        <div className="card" style={{ textAlign:"center", padding:"60px 24px" }}>
          <div style={{ fontSize:48, marginBottom:14 }}>📊</div>
          <p style={{ fontFamily:"var(--sans)", fontSize:14, fontWeight:300, color:"var(--text-2)", marginBottom:6 }}>No entries yet</p>
          <p style={{ fontFamily:"var(--sans)", fontSize:12, color:"var(--text-3)" }}>Add your assets and liabilities to calculate your net worth</p>
        </div>
      ) : (
        <div style={{ opacity:mounted?1:0, animation:mounted?"floatUp .5s .2s ease both":"none" }}>
          {/* Tabs */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, background:"rgba(255,255,255,0.03)", border:"1px solid var(--bdr)", borderRadius:"var(--r-md)", padding:4, marginBottom:20 }}>
            {[{ id:"assets", label:`📈 Assets (${assets.length})` }, { id:"liabilities", label:`📉 Liabilities (${liabilities.length})` }].map(({ id, label }) => (
              <button key={id} className="tab-btn" onClick={() => setTab(id)}
                style={{ fontFamily:"var(--sans)", fontSize:13, fontWeight:tab===id?600:400, padding:"9px 0", borderRadius:"var(--r-sm)", border:"none", cursor:"pointer", background:tab===id?(id==="assets"?"rgba(74,222,128,0.15)":"rgba(248,113,113,0.15)"):"transparent", color:tab===id?(id==="assets"?"#4ADE80":"#F87171"):"var(--text-3)", transition:"all .2s" }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:14 }}>
            <p className="label" style={{ color:"var(--text-3)" }}>{tab === "assets" ? "All Assets" : "All Liabilities"}</p>
            <p style={{ fontFamily:"var(--serif)", fontSize:"1.4rem", color:tab==="assets"?"#4ADE80":"#F87171", margin:0 }}>{fmtINR(currentTotal)}</p>
          </div>

          {currentItems.length === 0 ? (
            <div className="card" style={{ textAlign:"center", padding:"36px 24px" }}>
              <p style={{ fontFamily:"var(--sans)", fontSize:14, color:"var(--text-3)", fontWeight:300 }}>No {tab} added yet. Click "+ Add Entry" above.</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {groupedItems.map(group => (
                <div key={group.id} className="card" style={{ padding:0, overflow:"hidden" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 22px", borderBottom:"1px solid var(--bdr)", background:"rgba(255,255,255,0.02)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:30, height:30, borderRadius:8, background:`${group.color}18`, border:`1px solid ${group.color}35`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{group.icon}</div>
                      <span style={{ fontFamily:"var(--sans)", fontSize:13, fontWeight:500, color:"var(--text)" }}>{group.label}</span>
                    </div>
                    <span style={{ fontFamily:"var(--serif)", fontSize:"1.1rem", color:group.color }}>{fmtINR(group.total)}</span>
                  </div>
                  {group.items.map((item, i) => (
                    <div key={item._id} className="nw-row" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 22px", borderBottom:i<group.items.length-1?"1px solid var(--bdr)":"none", transition:"background .15s", cursor:"default" }}>
                      <div>
                        <p style={{ fontFamily:"var(--sans)", fontSize:13, fontWeight:400, color:"var(--text-2)", margin:0 }}>{item.label}</p>
                        {item.note && <p style={{ fontFamily:"var(--sans)", fontSize:11, color:"var(--text-3)", margin:"2px 0 0", fontWeight:300 }}>{item.note}</p>}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                        <span style={{ fontFamily:"var(--serif)", fontSize:"1rem", color:group.color }}>{fmtINR(Number(item.amount))}</span>
                        <div className="nw-actions" style={{ display:"flex", gap:6 }}>
                          <button onClick={() => handleEdit(item)} className="btn-ghost" style={{ padding:"4px 12px", fontSize:11 }}>Edit</button>
                          <button onClick={() => handleDelete(item._id)} style={{ padding:"4px 12px", fontSize:11, fontFamily:"var(--sans)", cursor:"pointer", background:"var(--err-bg)", border:"1px solid rgba(248,113,113,.2)", borderRadius:"var(--r-md)", color:"var(--err)", transition:"background .15s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(248,113,113,.18)"} onMouseLeave={e => e.currentTarget.style.background="var(--err-bg)"}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}