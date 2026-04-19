import { useState } from "react";
import { C } from "../theme";

export default function Homepage({ onLogin }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const stats = [
    { icon:"👥", label:"Students", value:"1,200+" },
    { icon:"👨‍🏫", label:"Teachers", value:"85+" },
    { icon:"📚", label:"Subjects", value:"20+" },
    { icon:"🏆", label:"Years of Excellence", value:"35+" },
  ];

  const news = [
    { date:"April 2026", title:"Form IV Annual Exam Results Released", body:"Congratulations to all Form IV students. Division I pass rate reached 42% this year.", cat:"academic" },
    { date:"March 2026", title:"School Sports Day 2026", body:"Annual sports competition held successfully. Our athletes won 8 gold medals at regional level.", cat:"sports" },
    { date:"March 2026", title:"Science Fair Winners Announced", body:"Bonde Secondary students placed 1st and 2nd in the regional science fair competition.", cat:"academic" },
  ];

  return (
    <div style={HS.root}>
      {/* ── NAV ── */}
      <nav style={HS.nav}>
        <div style={HS.navBrand}>
          <span style={HS.navLogo}>🎓</span>
          <div>
            <div style={HS.navSchool}>BONDE Secondary School</div>
            <div style={HS.navTagline}>SmartSchool TZ</div>
          </div>
        </div>
        <div style={HS.navLinks}>
          {["About","Academics","Admissions","News","Contact"].map(l=>(
            <a key={l} href="#" style={HS.navLink}>{l}</a>
          ))}
          <button onClick={onLogin} style={HS.navLoginBtn}>Student Portal →</button>
        </div>
        <button style={HS.hamburger} onClick={()=>setMenuOpen(p=>!p)}>☰</button>
      </nav>
      {menuOpen && (
        <div style={HS.mobileMenu}>
          {["About","Academics","Admissions","News","Contact"].map(l=>(
            <a key={l} href="#" style={HS.mobileLink}>{l}</a>
          ))}
          <button onClick={onLogin} style={{...HS.navLoginBtn,margin:"8px 16px"}}>Student Portal →</button>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={HS.hero}>
        <div style={HS.heroOverlay}/>
        <div style={HS.heroContent}>
          <div style={HS.heroBadge}>🏫 Est. 1989 — Kigoma, Tanzania</div>
          <h1 style={HS.heroH1}>Excellence in<br/><span style={HS.heroAccent}>Education & Character</span></h1>
          <p style={HS.heroP}>Empowering the next generation of Tanzanian leaders through quality education, discipline, and innovation.</p>
          <div style={HS.heroBtns}>
            <button onClick={onLogin} style={HS.heroPrimaryBtn}>🎓 Student Portal</button>
            <a href="#about" style={HS.heroSecondaryBtn}>Learn More →</a>
          </div>
        </div>
        <div style={HS.heroDecor}>
          <div style={HS.heroCard}>
            <div style={{fontSize:36,marginBottom:8}}>📊</div>
            <div style={{fontSize:22,fontWeight:900,color:C.primary}}>42%</div>
            <div style={{fontSize:12,color:C.textSub}}>Division I Rate 2025</div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={HS.statsRow}>
        {stats.map(s=>(
          <div key={s.label} style={HS.statCard}>
            <div style={HS.statIcon}>{s.icon}</div>
            <div style={HS.statValue}>{s.value}</div>
            <div style={HS.statLabel}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── ABOUT ── */}
      <section style={HS.section} id="about">
        <div style={HS.sectionInner}>
          <div style={HS.sectionBadge}>About Us</div>
          <h2 style={HS.sectionH2}>A Proud Institution of Learning</h2>
          <div style={HS.aboutGrid}>
            <div>
              <p style={HS.bodyText}>Bonde Secondary School is a government-aided secondary school located in Kigoma Municipal, Tanzania. Founded in 1989 under the Prime Minister's Office, we have consistently produced outstanding graduates who contribute meaningfully to society.</p>
              <p style={{...HS.bodyText,marginTop:16}}>Our school offers both O-Level and A-Level education with a strong focus on Sciences, Arts, and Commercial subjects. We believe in holistic development — academic excellence combined with moral character.</p>
              <div style={HS.featureList}>
                {["Modern Science Laboratories","Spacious Library","Computer Lab & Internet","Sports Facilities","Boarding Facilities","Student Counseling"].map(f=>(
                  <div key={f} style={HS.featureItem}>
                    <span style={{color:C.primary,fontWeight:700,marginRight:8}}>✓</span>{f}
                  </div>
                ))}
              </div>
            </div>
            <div style={HS.aboutImageBox}>
              <div style={HS.aboutEmoji}>🏫</div>
              <div style={HS.aboutCaption}>BONDE Secondary School — Kigoma</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PORTAL CTA ── */}
      <section style={HS.ctaSection}>
        <div style={HS.ctaInner}>
          <h2 style={HS.ctaH2}>Access SmartSchool Portal</h2>
          <p style={HS.ctaP}>Students can view results, subjects, timetable and announcements online from any device.</p>
          <div style={HS.ctaBtns}>
            <button onClick={onLogin} style={HS.ctaBtn}>🎓 Student Login</button>
            <button onClick={onLogin} style={HS.ctaBtnOutline}>👨‍💼 Admin / Teacher Login</button>
          </div>
          <div style={HS.ctaApps}>
            <div style={HS.appBadge}>📱 iOS App</div>
            <div style={HS.appBadge}>🤖 Android App</div>
            <div style={HS.appBadge}>💻 Web App</div>
          </div>
        </div>
      </section>

      {/* ── NEWS ── */}
      <section style={HS.section}>
        <div style={HS.sectionInner}>
          <div style={HS.sectionBadge}>Latest News</div>
          <h2 style={HS.sectionH2}>School Updates</h2>
          <div style={HS.newsGrid}>
            {news.map((n,i)=>(
              <div key={i} style={HS.newsCard}>
                <div style={[HS.newsCat,{background:n.cat==="academic"?C.primary:C.accent}]}>{n.cat.toUpperCase()}</div>
                <div style={HS.newsDate}>{n.date}</div>
                <h3 style={HS.newsTitle}>{n.title}</h3>
                <p style={HS.newsBody}>{n.body}</p>
                <a href="#" style={HS.newsLink}>Read more →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={HS.footer}>
        <div style={HS.footerInner}>
          <div style={HS.footerBrand}>
            <div style={{fontSize:32,marginBottom:8}}>🎓</div>
            <div style={{fontWeight:900,fontSize:16,color:"#fff"}}>BONDE Secondary School</div>
            <div style={{color:"rgba(255,255,255,0.6)",fontSize:12,marginTop:4}}>SmartSchool TZ</div>
          </div>
          <div style={HS.footerCols}>
            <div>
              <div style={HS.footerColTitle}>Contact</div>
              <div style={HS.footerItem}>📍 Tanga DC, Tanzania</div>
              <div style={HS.footerItem}>📞 +255 28 280 XXXX</div>
              <div style={HS.footerItem}>✉️ info@bonde.ac.tz</div>
            </div>
            <div>
              <div style={HS.footerColTitle}>Quick Links</div>
              {["Student Portal","Admin Portal","About Us","Admissions","Contact"].map(l=>(
                <div key={l}><a href="#" style={HS.footerLink}>{l}</a></div>
              ))}
            </div>
          </div>
        </div>
        <div style={HS.footerBottom}>© 2026 BONDE Secondary School. All rights reserved. | SmartSchool TZ v2.0</div>
      </footer>
    </div>
  );
}

const HS = {
  root: { fontFamily:"'Plus Jakarta Sans',sans-serif", color:C.text, background:C.bg },
  nav:  { background:"#fff", padding:"0 5%", display:"flex", alignItems:"center", justifyContent:"space-between",
          height:66, position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 12px rgba(0,0,0,0.08)" },
  navBrand: { display:"flex", alignItems:"center", gap:12 },
  navLogo:  { fontSize:32 },
  navSchool:{ fontWeight:900, fontSize:15, color:C.text },
  navTagline:{ fontSize:10, color:C.primary, fontWeight:700, letterSpacing:1, textTransform:"uppercase" },
  navLinks: { display:"flex", alignItems:"center", gap:24, "@media(max-width:768px)":{display:"none"} },
  navLink:  { color:C.textSub, fontSize:13, fontWeight:600, textDecoration:"none", transition:"color 0.2s" },
  navLoginBtn:{ background:C.primary, color:"#fff", border:"none", borderRadius:10, padding:"9px 18px",
                fontSize:13, cursor:"pointer", fontWeight:800 },
  hamburger:{ display:"none", background:"none", border:"none", fontSize:22, cursor:"pointer" },
  mobileMenu:{ background:"#fff", padding:"12px 0", borderBottom:`2px solid ${C.border}`, display:"flex", flexDirection:"column" },
  mobileLink:{ color:C.text, fontSize:14, fontWeight:600, textDecoration:"none", padding:"10px 20px" },

  hero: { minHeight:540, background:`linear-gradient(135deg, ${C.primaryDark} 0%, ${C.primary} 60%, ${C.primaryLight} 100%)`,
          display:"flex", alignItems:"center", padding:"60px 5%", gap:40, position:"relative", overflow:"hidden" },
  heroOverlay: { position:"absolute", inset:0, background:"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" },
  heroContent: { flex:1, position:"relative", zIndex:1 },
  heroBadge:   { display:"inline-block", background:"rgba(255,255,255,0.15)", color:"#fff", borderRadius:20,
                 padding:"5px 14px", fontSize:12, fontWeight:700, marginBottom:20, backdropFilter:"blur(4px)" },
  heroH1:      { fontSize:42, fontWeight:900, color:"#fff", lineHeight:1.15, marginBottom:16 },
  heroAccent:  { color:C.accent },
  heroP:       { color:"rgba(255,255,255,0.85)", fontSize:16, lineHeight:1.7, marginBottom:28, maxWidth:500 },
  heroBtns:    { display:"flex", gap:14, flexWrap:"wrap" },
  heroPrimaryBtn:{ background:C.accent, color:C.text, border:"none", borderRadius:12, padding:"14px 28px",
                   fontSize:15, fontWeight:900, cursor:"pointer" },
  heroSecondaryBtn:{ background:"rgba(255,255,255,0.15)", color:"#fff", border:"1.5px solid rgba(255,255,255,0.4)",
                    borderRadius:12, padding:"14px 28px", fontSize:15, fontWeight:700, cursor:"pointer",
                    textDecoration:"none", display:"inline-flex", alignItems:"center", backdropFilter:"blur(4px)" },
  heroDecor:   { position:"relative", zIndex:1 },
  heroCard:    { background:"rgba(255,255,255,0.95)", borderRadius:20, padding:"24px 30px", textAlign:"center",
                 boxShadow:"0 20px 60px rgba(0,0,0,0.2)", minWidth:160 },

  statsRow: { display:"flex", gap:0, background:"#fff", borderBottom:`1px solid ${C.border}` },
  statCard: { flex:1, padding:"24px 16px", textAlign:"center", borderRight:`1px solid ${C.border}` },
  statIcon: { fontSize:28, marginBottom:8 },
  statValue:{ fontSize:28, fontWeight:900, color:C.primary },
  statLabel:{ fontSize:12, color:C.textSub, fontWeight:600, marginTop:4 },

  section:     { padding:"72px 5%" },
  sectionInner:{ maxWidth:1100, margin:"0 auto" },
  sectionBadge:{ display:"inline-block", background:`${C.primary}15`, color:C.primary, borderRadius:20,
                 padding:"5px 14px", fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:1, marginBottom:12 },
  sectionH2:   { fontSize:32, fontWeight:900, color:C.text, marginBottom:32 },

  aboutGrid:   { display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" },
  bodyText:    { fontSize:15, lineHeight:1.75, color:C.textSub },
  featureList: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 20px", marginTop:24 },
  featureItem: { fontSize:13, fontWeight:600, color:C.text },
  aboutImageBox:{ background:`linear-gradient(135deg, ${C.primary} 0%, ${C.primaryLight} 100%)`,
                  borderRadius:24, padding:48, textAlign:"center", boxShadow:"0 20px 60px rgba(0,137,123,0.3)" },
  aboutEmoji:  { fontSize:80, marginBottom:16 },
  aboutCaption:{ color:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:600 },

  ctaSection:  { background:`linear-gradient(135deg, ${C.primaryDark} 0%, ${C.primary} 100%)`, padding:"72px 5%" },
  ctaInner:    { maxWidth:700, margin:"0 auto", textAlign:"center" },
  ctaH2:       { fontSize:32, fontWeight:900, color:"#fff", marginBottom:12 },
  ctaP:        { color:"rgba(255,255,255,0.8)", fontSize:16, lineHeight:1.7, marginBottom:32 },
  ctaBtns:     { display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", marginBottom:24 },
  ctaBtn:      { background:C.accent, color:C.text, border:"none", borderRadius:12, padding:"14px 28px",
                 fontSize:15, fontWeight:900, cursor:"pointer" },
  ctaBtnOutline:{ background:"rgba(255,255,255,0.12)", color:"#fff", border:"1.5px solid rgba(255,255,255,0.4)",
                  borderRadius:12, padding:"14px 28px", fontSize:15, fontWeight:700, cursor:"pointer",
                  backdropFilter:"blur(4px)" },
  ctaApps:     { display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" },
  appBadge:    { background:"rgba(255,255,255,0.15)", color:"#fff", borderRadius:10, padding:"8px 16px",
                 fontSize:13, fontWeight:700, border:"1px solid rgba(255,255,255,0.25)" },

  newsGrid:    { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 },
  newsCard:    { background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.06)",
                 display:"flex", flexDirection:"column", gap:10 },
  newsCat:     { display:"inline-block", color:"#fff", borderRadius:6, padding:"3px 10px",
                 fontSize:10, fontWeight:800, letterSpacing:1, width:"fit-content" },
  newsDate:    { fontSize:11, color:C.textMuted, fontWeight:600 },
  newsTitle:   { fontSize:15, fontWeight:800, color:C.text, lineHeight:1.4 },
  newsBody:    { fontSize:13, color:C.textSub, lineHeight:1.65, flex:1 },
  newsLink:    { color:C.primary, fontSize:13, fontWeight:700, textDecoration:"none" },

  footer:      { background:"#0D1B2A", padding:"48px 5% 0" },
  footerInner: { maxWidth:1100, margin:"0 auto", display:"flex", gap:48, paddingBottom:40,
                 borderBottom:"1px solid rgba(255,255,255,0.08)" },
  footerBrand: { flex:"0 0 220px" },
  footerCols:  { display:"flex", gap:48, flex:1 },
  footerColTitle:{ fontWeight:800, color:"#fff", marginBottom:14, fontSize:13, textTransform:"uppercase", letterSpacing:0.8 },
  footerItem:  { color:"rgba(255,255,255,0.55)", fontSize:13, marginBottom:8 },
  footerLink:  { color:"rgba(255,255,255,0.55)", fontSize:13, textDecoration:"none", marginBottom:8, display:"block" },
  footerBottom:{ textAlign:"center", padding:"16px 0", color:"rgba(255,255,255,0.3)", fontSize:11 },
};
