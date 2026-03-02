import { useMemo } from "react";

const CAT_COLOR = { Food:"#FB923C", Travel:"#60A5FA", Shopping:"#C084FC", Bills:"#F87171", Other:"#94A3B8" };

export default function MonthlySummary({ expenses=[] }) {
  const months = useMemo(() => {
    const map = {};
    expenses.forEach(e => {
      const d   = new Date(e.date || e.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const lbl = d.toLocaleString("default", { month:"long", year:"numeric" });
      if (!map[key]) map[key] = { key, lbl, total:0, count:0, cats:{} };
      map[key].total += e.amount;
      map[key].count += 1;
      map[key].cats[e.category] = (map[key].cats[e.category]||0)+e.amount;
    });
    return Object.values(map).sort((a,b) => b.key.localeCompare(a.key));
  }, [expenses]);

  const exportCSV = () => {
    const rows = [["Title","Amount","Category","Date"]];
    expenses.forEach(e => rows.push([e.title, e.amount, e.category, new Date(e.date||e.createdAt).toLocaleDateString("en-IN")]));
    const blob = new Blob([rows.map(r=>r.join(",")).join("\n")], { type:"text/csv" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download:`expenses_${new Date().toISOString().slice(0,10)}.csv` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  if (!months.length) return null;

  return (
    <div className="card">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 20 }}>
        <div>
          <p className="label" style={{ marginBottom: 4, color:"var(--accent)", opacity:.7 }}>History</p>
          <h3 style={{ fontFamily:"var(--serif)", fontSize:"1.3rem", fontWeight:400, color:"var(--text)" }}>Monthly Summary</h3>
        </div>
        <button onClick={exportCSV} className="btn-primary" style={{ padding:"9px 18px", fontSize:12, gap:6 }}>
          📤 Export CSV
        </button>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {months.map(m => (
          <div key={m.key} style={{
            border:"1px solid var(--bdr)", borderRadius:"var(--r-lg)", padding:"18px 20px",
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <div>
                <h4 style={{ fontFamily:"var(--serif)", fontSize:"1rem", fontWeight:400, color:"var(--text)", marginBottom:2 }}>{m.lbl}</h4>
                <span style={{ fontFamily:"var(--sans)", fontSize:11, color:"var(--text-3)" }}>{m.count} expense{m.count!==1?"s":""}</span>
              </div>
              <span style={{ fontFamily:"var(--serif)", fontSize:"1.1rem", color:"var(--accent)" }}>
                ₹{m.total.toLocaleString()}
              </span>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {Object.entries(m.cats).sort((a,b)=>b[1]-a[1]).map(([cat, amt]) => {
                const pct = Math.round(amt/m.total*100);
                return (
                  <div key={cat}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontFamily:"var(--sans)", fontSize:12, color:"var(--text-2)" }}>{cat}</span>
                      <span style={{ fontFamily:"var(--sans)", fontSize:12, color:"var(--text-3)" }}>₹{amt.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div style={{ height:3, background:"rgba(255,255,255,0.05)", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background: CAT_COLOR[cat]||"#94A3B8", borderRadius:99, transition:"width .6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}