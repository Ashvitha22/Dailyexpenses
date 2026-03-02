import { useState } from "react";

export default function FilterBar({ onFilter }) {
  const [category, setCategory] = useState("");
  const [from, setFrom]         = useState("");
  const [to, setTo]             = useState("");

  const apply = () => {
    const params = {};
    if (category) params.category = category;
    if (from)     params.from     = from;
    if (to)       params.to       = to;
    onFilter(params);
  };

  const clear = () => {
    setCategory(""); setFrom(""); setTo("");
    onFilter({});
  };

  const inp = {
    fontFamily: "var(--sans)", fontSize: 13, fontWeight: 300,
    color: "var(--text)", background: "rgba(255,255,255,0.03)",
    border: "1px solid var(--bdr)", borderRadius: "var(--r-md)",
    padding: "9px 12px", outline: "none",
    colorScheme: "dark",
  };

  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <p className="label" style={{ marginBottom: 14, color: "var(--accent)", opacity: 0.7 }}>Filter</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label className="label">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            style={{ ...inp, minWidth: 150 }}>
            <option value="">All Categories</option>
            {["Food","Travel","Shopping","Bills","Other"].map(c =>
              <option key={c} value={c}>{c}</option>
            )}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label className="label">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inp} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label className="label">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inp} />
        </div>

        <div style={{ display: "flex", gap: 8, paddingBottom: 1 }}>
          <button onClick={clear} className="btn-ghost" style={{ padding: "9px 18px", fontSize: 13 }}>Clear</button>
          <button onClick={apply} className="btn-primary" style={{ padding: "9px 20px", fontSize: 13 }}>Apply</button>
        </div>
      </div>
    </div>
  );
}