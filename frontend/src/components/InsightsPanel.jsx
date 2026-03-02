import { useMemo } from "react";

function buildInsights(expenses, budgets) {
  if (!expenses.length) return [];
  const insights = [];
  const total    = expenses.reduce((s, e) => s + e.amount, 0);
  const byCat    = expenses.reduce((a, e) => { a[e.category] = (a[e.category]||0)+e.amount; return a; }, {});
  const topCat   = Object.entries(byCat).sort((a,b) => b[1]-a[1])[0];

  if (topCat) {
    const pct = Math.round(topCat[1]/total*100);
    insights.push({ icon:"🔥", type: pct>50?"warn":"info", title:"Top Category", text:`${pct}% of spending goes to ${topCat[0]} (₹${topCat[1].toLocaleString()}). ${pct>50?"Consider rebalancing.":"Looking balanced!"}` });
  }
  const days = new Set(expenses.map(e=>(e.date||e.createdAt)?.slice(0,10))).size;
  insights.push({ icon:"📅", type:"info", title:"Daily Average", text:`Avg ₹${days ? Math.round(total/days).toLocaleString() : 0} per day across ${days} active day${days!==1?"s":""}.` });

  const big = [...expenses].sort((a,b)=>b.amount-a.amount)[0];
  if (big) insights.push({ icon:"💸", type: big.amount>total*.3?"warn":"info", title:"Largest Expense", text:`"${big.title}" at ₹${big.amount.toLocaleString()} is ${Math.round(big.amount/total*100)}% of total spend.` });

  budgets.forEach(b => {
    const pct = Math.round(b.spent/b.amount*100);
    if (pct>=90 && b.remaining>0)
      insights.push({ icon:"⚠️", type:"warn", title:`${b.category} Critical`, text:`${pct}% of ${b.category} budget used. Only ₹${b.remaining?.toLocaleString()} left — spend carefully!` });
  });

  if (topCat && topCat[1]>500)
    insights.push({ icon:"💡", type:"tip", title:"Saving Tip", text:`Cutting ${topCat[0]} by 20% saves ₹${Math.round(topCat[1]*.2).toLocaleString()} — great for a savings goal!` });

  return insights.slice(0,5);
}

const TYPE = {
  warn: { bdr:"rgba(251,191,36,.22)", bg:"rgba(251,191,36,.08)", color:"var(--warn)" },
  tip:  { bdr:"rgba(94,234,212,.22)", bg:"rgba(94,234,212,.08)", color:"var(--accent)" },
  info: { bdr:"rgba(96,165,250,.22)", bg:"rgba(96,165,250,.07)", color:"#60A5FA" },
};

export default function InsightsPanel({ expenses=[], budgets=[] }) {
  const insights = useMemo(() => buildInsights(expenses, budgets), [expenses, budgets]);
  if (!insights.length) return null;

  return (
    <div className="card">
      <p className="label" style={{ marginBottom: 4, color: "var(--accent)", opacity: 0.7 }}>Smart Analysis</p>
      <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", fontWeight: 400, color: "var(--text)", marginBottom: 18 }}>
        Spending Insights
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {insights.map((ins, i) => {
          const s = TYPE[ins.type] || TYPE.info;
          return (
            <div key={i} style={{
              display: "flex", gap: 14, padding: "14px 16px",
              borderRadius: "var(--r-md)",
              border: `1px solid ${s.bdr}`, background: s.bg,
            }}>
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{ins.icon}</span>
              <div>
                <p style={{ fontFamily: "var(--sans)", fontSize: 12, fontWeight: 600, color: s.color, letterSpacing: "0.04em", marginBottom: 4 }}>
                  {ins.title}
                </p>
                <p style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 300, color: "var(--text-2)", lineHeight: 1.55 }}>
                  {ins.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}