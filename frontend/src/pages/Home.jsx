import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function Home() {
  const navigate = useNavigate();
  return (
    <Layout>
      <div style={{ fontFamily:"var(--sans)", color:"var(--text)", width:"100%" }}>

        {/* HERO */}
        <section style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", padding:"110px 24px 70px" }}>
          <div className="anim-1" style={{
            display:"inline-flex", alignItems:"center", gap:8, marginBottom:28,
            padding:"6px 18px", borderRadius:99,
            background:"var(--accent-bg)", border:"1px solid var(--accent-bdr)",
            fontFamily:"var(--sans)", fontSize:11, fontWeight:500, letterSpacing:"0.16em", textTransform:"uppercase", color:"var(--accent)",
          }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--accent)", display:"inline-block", animation:"blink 2s infinite" }} />
            Personal Finance Intelligence
          </div>

          <h1 className="anim-2" style={{
            fontFamily:"var(--serif)", fontSize:"clamp(2.6rem,6vw,4.2rem)",
            fontWeight:400, lineHeight:1.08, letterSpacing:"-0.02em",
            maxWidth:780, marginBottom:22, color:"var(--text)",
          }}>
            Know exactly where<br />
            your{" "}
            <span style={{ background:"linear-gradient(135deg,var(--accent) 0%,#a5f3fc 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", fontStyle:"italic" }}>
              money lives
            </span>
          </h1>

          <p className="anim-3" style={{ maxWidth:480, fontSize:16, fontWeight:300, color:"var(--text-2)", lineHeight:1.7, marginBottom:40 }}>
            <strong style={{ color:"var(--text)", fontWeight:500 }}>DailyExpense</strong> helps you track, categorize, and analyze spending — beautifully organized, always secure.
          </p>

          <div className="anim-4" style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
            <button onClick={() => navigate("/register")} className="btn-primary" style={{ padding:"14px 36px", fontSize:14 }}>
              Get Started Free
            </button>
            <button onClick={() => navigate("/login")} className="btn-ghost" style={{ padding:"13px 28px", fontSize:14 }}>
              Sign In →
            </button>
          </div>
        </section>

        {/* STATS */}
        <div className="anim-5" style={{ maxWidth:500, margin:"0 auto 72px", padding:"0 24px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", border:"1px solid var(--bdr)", borderRadius:"var(--r-lg)", overflow:"hidden", background:"var(--bg-card)", backdropFilter:"blur(12px)" }}>
            {[{ v:"10+",label:"Categories"},{ v:"100%",label:"Secure"},{ v:"∞",label:"Expenses"}].map(({ v, label },i)=>(
              <div key={label} style={{ padding:"22px 16px", textAlign:"center", borderRight: i<2?"1px solid var(--bdr)":"none" }}>
                <div style={{ fontFamily:"var(--serif)", fontSize:"1.8rem", color:"var(--accent)", lineHeight:1, marginBottom:6 }}>{v}</div>
                <div className="label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ornament */}
        <div style={{ display:"flex", alignItems:"center", gap:16, maxWidth:220, margin:"0 auto 52px" }}>
          <div style={{ flex:1, height:1, background:"var(--bdr)" }} />
          <div style={{ width:7, height:7, transform:"rotate(45deg)", background:"var(--accent)", opacity:.6 }} />
          <div style={{ flex:1, height:1, background:"var(--bdr)" }} />
        </div>

        {/* FEATURES */}
        <section style={{ maxWidth:960, margin:"0 auto", padding:"0 24px 96px" }}>
          <p className="label" style={{ textAlign:"center", marginBottom:44 }}>Why choose us</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:1, background:"var(--bdr)", borderRadius:"var(--r-xl)", overflow:"hidden" }}>
            {[
              { n:"01", icon:"📊", title:"Expense Analytics", text:"Category-wise insights and trend breakdowns that make spending patterns instantly clear." },
              { n:"02", icon:"⚡", title:"Easy Tracking", text:"Add, edit, filter expenses in seconds. Designed to stay out of your way." },
              { n:"03", icon:"🔒", title:"Secure & Personal", text:"Protected with authentication. Only you have access to your own records." },
            ].map(({ n, icon, title, text }) => (
              <div key={n} style={{ background:"var(--bg-card)", backdropFilter:"blur(12px)", padding:"38px", transition:"background .3s", cursor:"default" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(22,22,31,0.9)"}
                onMouseLeave={e => e.currentTarget.style.background="var(--bg-card)"}
              >
                <span className="label" style={{ display:"block", marginBottom:14, color:"var(--accent)", opacity:.5 }}>{n}</span>
                <span style={{ fontSize:"1.9rem", display:"block", marginBottom:14 }}>{icon}</span>
                <h3 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:400, color:"var(--text)", marginBottom:8 }}>{title}</h3>
                <p style={{ fontSize:13, color:"var(--text-3)", lineHeight:1.7, fontWeight:300 }}>{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER STRIP */}
        <div style={{ borderTop:"1px solid var(--bdr)", padding:"28px 24px", textAlign:"center" }}>
          <p style={{ fontSize:14, color:"var(--text-3)", fontWeight:300 }}>
            Ready to take control?{" "}
            <button onClick={() => navigate("/register")}
              style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"var(--sans)", fontSize:14, fontWeight:500, color:"var(--accent)", textDecoration:"underline", textUnderlineOffset:4 }}>
              Create your free account →
            </button>
          </p>
        </div>
      </div>
    </Layout>
  );
}