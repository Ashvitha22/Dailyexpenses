import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { getExpenses } from "../services/expenseService";
import { getBudgets }  from "../services/budgetService";
import Layout from "../components/Layout";

const CAT_COLORS = { Food:"#FB923C", Travel:"#60A5FA", Shopping:"#C084FC", Bills:"#F87171", Other:"#94A3B8" };
const PALETTE    = ["#5EEAD4","#60A5FA","#C084FC","#FB923C","#F87171","#94A3B8","#34D399","#FBBF24"];

const TIP = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"var(--bg-elevated)", border:"1px solid var(--bdr-2)", borderRadius:"var(--r-md)", padding:"10px 14px" }}>
      {payload.map((p, i) => (
        <p key={i} style={{ fontFamily:"var(--sans)", fontSize:12, color: p.color || "var(--text)", margin:"2px 0" }}>
          <span style={{ color:"var(--text-2)" }}>{p.name}: </span>₹{Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getExpenses(), getBudgets()])
      .then(([e, b]) => { setExpenses(e.data); setBudgets(b.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total    = expenses.reduce((s, e) => s + e.amount, 0);
  const avgEntry = expenses.length ? Math.round(total / expenses.length) : 0;

  // Pie: by category
  const byCat = Object.entries(
    expenses.reduce((a, e) => { a[e.category] = (a[e.category]||0)+e.amount; return a; }, {})
  ).map(([name, value]) => ({ name, value }));

  // Line: daily trend (last 30)
  const dailyMap = {};
  expenses.forEach(e => {
    const d = (e.date || e.createdAt)?.slice(0,10);
    if (d) dailyMap[d] = (dailyMap[d]||0) + e.amount;
  });
  const dailyData = Object.entries(dailyMap)
    .sort(([a],[b]) => a.localeCompare(b)).slice(-30)
    .map(([date, amount]) => ({ date: date.slice(5), amount }));

  // Bar: monthly
  const monthMap = {};
  expenses.forEach(e => {
    const d = new Date(e.date || e.createdAt);
    const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    monthMap[k] = (monthMap[k]||0)+e.amount;
  });
  const monthData = Object.entries(monthMap).sort(([a],[b])=>a.localeCompare(b)).slice(-6)
    .map(([month, amount]) => ({ month: month.slice(2), amount }));

  // Budget vs spent
  const budgetData = budgets.map(b => ({ name: b.category, Budget: b.amount, Spent: b.spent || 0 }));

  // Top category
  const topCat = byCat.sort((a,b)=>b.value-a.value)[0];

  const STAT_CARDS = [
    { label:"Total Spent",    value:`₹${total.toLocaleString()}`,           icon:"💸" },
    { label:"Transactions",   value: expenses.length,                        icon:"🧾" },
    { label:"Avg per Entry",  value:`₹${avgEntry.toLocaleString()}`,         icon:"📈" },
    { label:"Top Category",   value: topCat?.name || "—",                    icon:"🏆" },
  ];

  const chartCard = (label, title, children) => (
    <div className="card">
      <p className="label" style={{ marginBottom:4, color:"var(--accent)", opacity:.7 }}>{label}</p>
      <h3 style={{ fontFamily:"var(--serif)", fontSize:"1.2rem", fontWeight:400, color:"var(--text)", marginBottom:20 }}>{title}</h3>
      {children}
    </div>
  );

  if (loading) return (
    <Layout title="Analytics">
      <div style={{ textAlign:"center", padding:80, fontFamily:"var(--sans)", fontSize:12, color:"var(--text-3)", letterSpacing:"0.14em", textTransform:"uppercase", animation:"blink 1.6s infinite" }}>
        Loading analytics…
      </div>
    </Layout>
  );

  return (
    <Layout title="Analytics">

      {/* Summary stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, border:"1px solid var(--bdr)", borderRadius:"var(--r-xl)", overflow:"hidden", background:"var(--bdr)", backdropFilter:"blur(16px)" }}>
        {STAT_CARDS.map(({ label, value, icon }) => (
          <div key={label} style={{ background:"var(--bg-card)", padding:"22px 20px" }}>
            <div style={{ fontSize:22, marginBottom:10 }}>{icon}</div>
            <div style={{ fontFamily:"var(--serif)", fontSize:"1.6rem", color:"var(--accent)", lineHeight:1, marginBottom:6 }}>{value}</div>
            <div className="label">{label}</div>
          </div>
        ))}
      </div>

      {expenses.length === 0 ? (
        <div className="card" style={{ textAlign:"center", padding:"60px 24px" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📊</div>
          <p style={{ fontFamily:"var(--sans)", fontSize:14, color:"var(--text-2)", fontWeight:300 }}>No expense data yet. Add some expenses to see analytics.</p>
        </div>
      ) : (
        <>
          {/* Pie + Line row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:20 }}>
            {chartCard("Breakdown", "Spending by Category",
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={byCat} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                    dataKey="value" nameKey="name" paddingAngle={3}>
                    {byCat.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip content={<TIP />} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {chartCard("Trend", "Daily Spending (Last 30 Days)",
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontFamily:"var(--sans)", fontSize:10, fill:"var(--text-3)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontFamily:"var(--sans)", fontSize:10, fill:"var(--text-3)" }} tickLine={false} axisLine={false} tickFormatter={v=>`₹${v}`} />
                  <Tooltip content={<TIP />} />
                  <Line type="monotone" dataKey="amount" stroke="var(--accent)" strokeWidth={2} dot={false} name="Spent" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Monthly bar */}
          {chartCard("History", "Monthly Spending",
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fontFamily:"var(--sans)", fontSize:10, fill:"var(--text-3)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontFamily:"var(--sans)", fontSize:10, fill:"var(--text-3)" }} tickLine={false} axisLine={false} tickFormatter={v=>`₹${v}`} />
                <Tooltip content={<TIP />} />
                <Bar dataKey="amount" fill="var(--accent)" radius={[4,4,0,0]} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Budget vs spent */}
          {budgetData.length > 0 && chartCard("Comparison", "Budget vs Actual Spending",
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={budgetData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontFamily:"var(--sans)", fontSize:10, fill:"var(--text-3)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontFamily:"var(--sans)", fontSize:10, fill:"var(--text-3)" }} tickLine={false} axisLine={false} tickFormatter={v=>`₹${v}`} />
                <Tooltip content={<TIP />} />
                <Legend wrapperStyle={{ fontFamily:"var(--sans)", fontSize:11, color:"var(--text-2)" }} />
                <Bar dataKey="Budget" fill="rgba(94,234,212,0.35)" radius={[4,4,0,0]} />
                <Bar dataKey="Spent"  fill="var(--accent)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Category breakdown list */}
          {chartCard("Detail", "Category Breakdown Top spendings",
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {byCat.map((cat, i) => {
                const pct = Math.round(cat.value / total * 100);
                const color = PALETTE[i % PALETTE.length];
                return (
                  <div key={cat.name}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontFamily:"var(--sans)", fontSize:13, color:"var(--text-2)" }}>{cat.name}</span>
                      <div style={{ display:"flex", gap:12 }}>
                        <span style={{ fontFamily:"var(--sans)", fontSize:13, color:"var(--text-3)" }}>{pct}%</span>
                        <span style={{ fontFamily:"var(--serif)", fontSize:13, color:"var(--accent)" }}>₹{cat.value.toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background: color, borderRadius:99, transition:"width .6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

    </Layout>
  );
}