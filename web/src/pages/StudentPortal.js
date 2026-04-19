import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { C, GRADE_C, GRADE_B, DIV_C } from "../theme";

// ── STUDENT SHELL ─────────────────────────────────────────────────────────────
export function StudentPortal({ user, onLogout }) {
  const [page, setPage]       = useState("home");
  const [mobileNav, setMobileNav] = useState(false);

  const NAV = [
    { id:"home",       icon:"🏠", label:"Home" },
    { id:"results",    icon:"📊", label:"Results" },
    { id:"subjects",   icon:"📚", label:"Subjects" },
    { id:"timetable",  icon:"📅", label:"Timetable" },
    { id:"announcements",icon:"📢",label:"News" },
    { id:"profile",    icon:"👤", label:"Profile" },
  ];

  return (
    <div style={P.root}>
      {/* Sidebar */}
      <aside style={{...P.sidebar, transform:mobileNav?"translateX(0)":""}}>
        <div style={P.sideTop}>
          <div style={P.sideBrand}>
            <span style={{fontSize:28}}>🎓</span>
            <div>
              <div style={P.sideName}>SmartSchool TZ</div>
              <div style={P.sideSub}>BONDE Secondary</div>
            </div>
          </div>
          <div style={P.sideProfile}>
            <div style={P.sideAvatar}>{user.sex==="F"?"👩‍🎓":"👨‍🎓"}</div>
            <div>
              <div style={P.sideUser}>{user.fullName}</div>
              <div style={P.sideAdm}>Adm: {user.admissionNo}</div>
            </div>
          </div>
        </div>
        <nav style={P.nav}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>{setPage(n.id);setMobileNav(false);}}
              style={{...P.navItem,...(page===n.id?P.navItemActive:{})}}>
              <span style={{fontSize:18}}>{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={onLogout} style={P.logoutBtn}>🚪 Logout</button>
      </aside>

      {/* Main */}
      <div style={P.main}>
        <div style={P.topbar} className="no-print">
          <button style={P.menuBtn} onClick={()=>setMobileNav(p=>!p)}>☰</button>
          <div style={P.topbarTitle}>{NAV.find(n=>n.id===page)?.label}</div>
          <div style={P.topbarUser}>
            <span style={{fontSize:20}}>{user.sex==="F"?"👩‍🎓":"👨‍🎓"}</span>
            <span style={{fontSize:13,fontWeight:700,color:C.text}}>{user.fullName?.split(" ")[0]}</span>
          </div>
        </div>
        <div style={P.pageWrap}>
          {page==="home"        && <StudentHome user={user} onNav={setPage}/>}
          {page==="results"     && <StudentResults user={user}/>}
          {page==="subjects"    && <StudentSubjects/>}
          {page==="timetable"   && <StudentTimetable/>}
          {page==="announcements"&&<StudentAnnouncements/>}
          {page==="profile"     && <StudentProfilePage user={user} onLogout={onLogout}/>}
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileNav && <div style={P.overlay} onClick={()=>setMobileNav(false)}/>}
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function StudentHome({ user, onNav }) {
  const [results, setResults]   = useState(null);
  const [anns, setAnns]         = useState([]);

  useEffect(()=>{
    api.myResults().then(setResults).catch(()=>{});
    api.getAnnouncements().then(d=>setAnns(d.slice(0,3))).catch(()=>{});
  },[]);

  const cards = [
    { icon:"📊", label:"My Results",      page:"results",       desc:`Division ${results?.division??"-"}` },
    { icon:"📚", label:"My Subjects",     page:"subjects",      desc:"View Progress" },
    { icon:"📅", label:"Timetable",       page:"timetable",     desc:"Weekly Schedule" },
    { icon:"📢", label:"Announcements",   page:"announcements", desc:`${anns.length} Updates` },
  ];

  return(
    <div style={H.wrap}>
      {/* Hero */}
      <div style={H.hero}>
        <div>
          <div style={H.heroGreet}>Hello, {user.fullName?.split(" ")[0]} 👋</div>
          <div style={H.heroSub}>{user.form} — Stream {user.stream} · {user.className}</div>
        </div>
        {results && (
          <div style={H.heroBadge}>
            <div style={H.heroBadgeLabel}>Avg Score</div>
            <div style={H.heroBadgeValue}>{results.average}</div>
            <div style={{...H.divTag,background:DIV_C[results.division]??"#888"}}>Div {results.division}</div>
            <div style={{...H.statusTag,background:results.status==="PASS"?C.success:C.danger}}>{results.status}</div>
          </div>
        )}
      </div>

      {/* Quick nav cards */}
      <div style={H.cardGrid}>
        {cards.map(c=>(
          <button key={c.page} onClick={()=>onNav(c.page)} style={H.menuCard}>
            <div style={H.menuIcon}>{c.icon}</div>
            <div style={H.menuLabel}>{c.label}</div>
            <div style={H.menuDesc}>{c.desc}</div>
            <span style={H.menuArr}>›</span>
          </button>
        ))}
      </div>

      {/* Announcements preview */}
      {anns.length>0 && (
        <div style={H.annSection}>
          <div style={H.annTitle}>📢 Latest Updates</div>
          {anns.map(a=>(
            <div key={a.id} style={H.annCard}>
              <div style={{...H.annStripe,background:a.category==="academic"?C.primary:C.accent}}/>
              <div style={{flex:1}}>
                <div style={H.annHead}>{a.title}</div>
                <div style={H.annBody}>{a.body}</div>
                <div style={H.annDate}>{new Date(a.created_at).toLocaleDateString()} · {a.author}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── RESULTS ───────────────────────────────────────────────────────────────────
function StudentResults({ user }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ api.myResults().then(setData).finally(()=>setLoading(false)); },[]);

  if(loading) return <Spinner/>;

  return(
    <div style={R.wrap}>
      <div style={R.header}>
        <h2 style={R.title}>My Results</h2>
        <button onClick={()=>window.print()} style={R.printBtn} className="no-print">🖨️ Print</button>
      </div>

      <div style={R.metaRow}>
        {[["Student",user.fullName],["Admission",user.admissionNo],["Class",user.className],["Stream",user.stream]].map(([k,v])=>(
          <div key={k} style={R.meta}><div style={R.metaKey}>{k}</div><div style={R.metaVal}>{v}</div></div>
        ))}
      </div>

      <div style={R.tableWrap}>
        <table style={R.table}>
          <thead>
            <tr style={{background:C.primary}}>
              {["Subject","Score","Grade","Remarks"].map(h=>(
                <th key={h} style={R.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data?.results??[]).map((r,i)=>(
              <tr key={i} style={{background:i%2===0?"#fff":C.bg}}>
                <td style={{...R.td,fontWeight:700}}>{r.subject}</td>
                <td style={{...R.td,fontWeight:800,color:GRADE_C[r.grade],background:GRADE_B[r.grade]}}>{r.score??"-"}</td>
                <td style={{...R.td,fontWeight:900,color:GRADE_C[r.grade]}}>{r.grade??"-"}</td>
                <td style={{...R.td,color:C.textSub}}>{r.remarks??"-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && (
        <div style={R.summaryRow}>
          <div style={R.sumCard}><div style={R.sumVal}>{data.total}</div><div style={R.sumKey}>Total Score</div></div>
          <div style={R.sumCard}><div style={R.sumVal}>{data.average}</div><div style={R.sumKey}>Average</div></div>
          <div style={R.sumCard}><div style={{...R.sumVal,color:DIV_C[data.division]}}>Div {data.division}</div><div style={R.sumKey}>Division</div></div>
          <div style={R.sumCard}><div style={R.sumVal}>{data.points}</div><div style={R.sumKey}>Points</div></div>
          <div style={{...R.sumCard,background:data.status==="PASS"?C.success:C.danger}}>
            <div style={{...R.sumVal,color:"#fff"}}>{data.status}</div>
            <div style={{...R.sumKey,color:"rgba(255,255,255,0.8)"}}>Status</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SUBJECTS ──────────────────────────────────────────────────────────────────
function StudentSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(()=>{ api.mySubjects().then(setSubjects).finally(()=>setLoading(false)); },[]);
  if(loading) return <Spinner/>;

  return(
    <div style={SJ.wrap}>
      <h2 style={SJ.title}>My Subjects</h2>
      <div style={SJ.grid}>
        {subjects.map((s,i)=>(
          <div key={i} style={SJ.card}>
            <div style={SJ.cardTop}>
              <div style={SJ.iconBox}><span style={{fontSize:28}}>{s.icon}</span></div>
              <div style={{flex:1}}>
                <div style={SJ.subjName}>{s.subject}</div>
                <div style={SJ.subjTeacher}>{s.teacher}</div>
              </div>
              {s.grade && (
                <div style={{...SJ.gradeBadge,background:GRADE_C[s.grade],color:"#fff"}}>{s.grade}</div>
              )}
            </div>
            <div style={SJ.progLabel}>
              <span>Progress</span>
              <span style={{fontWeight:800,color:GRADE_C[s.grade]??C.primary}}>{s.progress}%</span>
            </div>
            <div style={SJ.progBg}>
              <div style={{...SJ.progFill,width:`${s.progress}%`,background:GRADE_C[s.grade]??C.primary}}/>
            </div>
            {s.score!==null && <div style={SJ.score}>Score: <b>{s.score}</b> — {s.remarks}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TIMETABLE ─────────────────────────────────────────────────────────────────
function StudentTimetable() {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
  const todayIdx = Math.min(Math.max(new Date().getDay()-1,0),4);
  const [timetable, setTimetable] = useState({});
  const [activeDay, setActiveDay] = useState(days[todayIdx]);
  const [loading, setLoading]     = useState(true);

  useEffect(()=>{ api.myTimetable().then(setTimetable).finally(()=>setLoading(false)); },[]);
  if(loading) return <Spinner/>;

  const periods = timetable[activeDay]??[];

  return(
    <div style={TT.wrap}>
      <h2 style={TT.title}>Weekly Timetable</h2>
      <div style={TT.dayTabs}>
        {days.map(d=>(
          <button key={d} onClick={()=>setActiveDay(d)}
            style={{...TT.dayTab,...(d===activeDay?TT.dayTabOn:{})}}>
            {d.slice(0,3)}
          </button>
        ))}
      </div>
      {periods.length===0
        ? <div style={TT.empty}>No classes on {activeDay}</div>
        : periods.map((p,i)=>(
          <div key={i} style={TT.periodRow}>
            <div style={TT.timeBox}>
              <div style={TT.timeStart}>{p.time_start}</div>
              <div style={TT.timeSep}>–</div>
              <div style={TT.timeEnd}>{p.time_end}</div>
            </div>
            <div style={TT.periodInfo}>
              <div style={TT.periodSubj}>{p.subject}</div>
              <div style={TT.periodMeta}>👨‍🏫 {p.teacher||"TBA"} · 🚪 Room {p.room||"-"}</div>
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────
function StudentAnnouncements() {
  const [anns, setAnns]     = useState([]);
  const [loading,setLoading]= useState(true);

  useEffect(()=>{ api.getAnnouncements().then(setAnns).finally(()=>setLoading(false)); },[]);
  if(loading) return <Spinner/>;

  return(
    <div style={{padding:24}}>
      <h2 style={{fontSize:22,fontWeight:900,color:C.text,marginBottom:20}}>📢 Announcements</h2>
      {anns.map(a=>(
        <div key={a.id} style={AN.card}>
          <div style={{...AN.stripe,background:a.category==="academic"?C.primary:C.accent}}/>
          <div style={AN.body}>
            <div style={AN.meta}>
              <span style={{...AN.cat,background:a.category==="academic"?`${C.primary}18`:C.accentLight,
                color:a.category==="academic"?C.primary:C.warning}}>{a.category?.toUpperCase()}</span>
              <span style={AN.date}>{new Date(a.created_at).toLocaleDateString("en-TZ",{day:"numeric",month:"long",year:"numeric"})}</span>
            </div>
            <div style={AN.title}>{a.title}</div>
            <div style={AN.text}>{a.body}</div>
            <div style={AN.author}>— {a.author}</div>
          </div>
        </div>
      ))}
      {!anns.length && <div style={{color:C.textMuted,textAlign:"center",padding:40}}>No announcements yet</div>}
    </div>
  );
}

// ── PROFILE ───────────────────────────────────────────────────────────────────
function StudentProfilePage({ user, onLogout }) {
  const [editing, setEditing]   = useState(false);
  const [guardian, setGuardian] = useState(user.guardianName??"");
  const [contact, setContact]   = useState(user.contactNumber??"");
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ guardianName:guardian, contactNumber:contact });
      setSaved(true); setEditing(false); setTimeout(()=>setSaved(false),2500);
    } catch {}
    finally { setSaving(false); }
  };

  return(
    <div style={PF.wrap}>
      <div style={PF.heroCard}>
        <div style={PF.avatar}>{user.sex==="F"?"👩‍🎓":"👨‍🎓"}</div>
        <div style={PF.name}>{user.fullName}</div>
        <div style={PF.sub}>Admission No: {user.admissionNo}</div>
        <div style={PF.sub}>{user.form} — Stream {user.stream}</div>
        <div style={PF.sub}>{user.className}</div>
      </div>

      {saved && <div style={PF.savedAlert}>✅ Profile updated successfully!</div>}

      <div style={PF.infoCard}>
        <div style={PF.infoCardTitle}>Personal Information</div>
        {[
          {icon:"🎂",label:"Date of Birth", value:user.dateOfBirth||"Not set", editable:false},
          {icon:"⚧",label:"Gender", value:user.sex==="M"?"Male":"Female", editable:false},
          {icon:"👨‍👩‍👦",label:"Guardian Name", value:guardian, editable:true, onChange:setGuardian},
          {icon:"📱",label:"Contact Number", value:contact, editable:true, onChange:setContact, type:"tel"},
        ].map(({icon,label,value,editable,onChange,type})=>(
          <div key={label} style={PF.infoRow}>
            <span style={PF.infoIcon}>{icon}</span>
            <div style={{flex:1}}>
              <div style={PF.infoLabel}>{label}</div>
              {editing&&editable
                ? <input value={value} onChange={e=>onChange(e.target.value)} type={type??"text"}
                    style={PF.infoInput}/>
                : <div style={PF.infoValue}>{value}</div>
              }
            </div>
          </div>
        ))}
      </div>

      <div style={PF.btnRow}>
        {editing
          ? <>
              <button onClick={save} disabled={saving} style={PF.saveBtn}>{saving?"Saving…":"💾 Save Changes"}</button>
              <button onClick={()=>setEditing(false)} style={PF.cancelBtn}>Cancel</button>
            </>
          : <button onClick={()=>setEditing(true)} style={PF.editBtn}>✏️ Edit Profile</button>
        }
        <button onClick={onLogout} style={PF.logoutBtn}>🚪 Logout</button>
      </div>
    </div>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────
function Spinner() {
  return(
    <div style={{display:"flex",flex:1,alignItems:"center",justifyContent:"center",height:300}}>
      <div style={{fontSize:32,animation:"spin 1s linear infinite"}}>⏳</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════════════════════
const P = {
  root:    { display:"flex", height:"100vh", overflow:"hidden", fontFamily:"'Plus Jakarta Sans',sans-serif" },
  sidebar: { width:230, background:C.sidebarBg, display:"flex", flexDirection:"column",
             flexShrink:0, transition:"transform 0.25s", zIndex:200 },
  sideTop: { padding:"20px 16px 0" },
  sideBrand:{ display:"flex", alignItems:"center", gap:10, marginBottom:24 },
  sideName: { color:"#fff", fontWeight:900, fontSize:13, lineHeight:1.2 },
  sideSub:  { color:"rgba(255,255,255,0.55)", fontSize:10, fontWeight:600, letterSpacing:0.5 },
  sideProfile:{ background:"rgba(255,255,255,0.1)", borderRadius:12, padding:"12px", display:"flex",
                gap:10, alignItems:"center", marginBottom:16 },
  sideAvatar: { fontSize:26 },
  sideUser:   { color:"#fff", fontWeight:700, fontSize:12, lineHeight:1.3 },
  sideAdm:    { color:"rgba(255,255,255,0.6)", fontSize:10 },
  nav:     { flex:1, padding:"8px 10px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" },
  navItem: { display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10,
             background:"transparent", border:"none", color:"rgba(255,255,255,0.7)", cursor:"pointer",
             fontSize:13, fontWeight:600, textAlign:"left", width:"100%", transition:"all 0.15s" },
  navItemActive:{ background:"rgba(255,255,255,0.18)", color:"#fff" },
  logoutBtn:{ margin:"10px 10px 16px", background:"rgba(255,255,255,0.08)", border:"none",
              color:"rgba(255,255,255,0.7)", borderRadius:10, padding:"10px", cursor:"pointer",
              fontSize:13, fontWeight:600 },
  main:    { flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:C.bg },
  topbar:  { background:"#fff", height:56, display:"flex", alignItems:"center", padding:"0 20px",
             gap:12, borderBottom:`1px solid ${C.border}`, flexShrink:0 },
  menuBtn: { background:"none", border:"none", fontSize:20, cursor:"pointer", color:C.textSub },
  topbarTitle:{ flex:1, fontWeight:800, fontSize:15, color:C.text },
  topbarUser: { display:"flex", alignItems:"center", gap:8 },
  pageWrap:{ flex:1, overflowY:"auto" },
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:150 },
};

const H = {
  wrap:   { padding:"0 0 32px" },
  hero:   { background:`linear-gradient(135deg,${C.primaryDark} 0%,${C.primary} 100%)`, padding:"24px 24px 28px",
            display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16 },
  heroGreet:{ fontSize:24,fontWeight:900,color:"#fff",marginBottom:4 },
  heroSub:  { fontSize:12,color:"rgba(255,255,255,0.75)",fontWeight:600 },
  heroBadge:{ background:"rgba(255,255,255,0.15)",borderRadius:14,padding:"14px 18px",
              textAlign:"center",backdropFilter:"blur(6px)",minWidth:140 },
  heroBadgeLabel:{ fontSize:10,color:"rgba(255,255,255,0.7)",fontWeight:700,textTransform:"uppercase",marginBottom:4 },
  heroBadgeValue:{ fontSize:30,fontWeight:900,color:"#fff",marginBottom:8 },
  divTag: { borderRadius:8,padding:"4px 10px",color:"#fff",fontSize:12,fontWeight:800,marginBottom:6,display:"inline-block" },
  statusTag:{ borderRadius:8,padding:"4px 12px",color:"#fff",fontSize:12,fontWeight:900,display:"inline-block" },
  cardGrid:{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,padding:"16px 16px 8px" },
  menuCard:{ background:"#fff",border:"none",borderRadius:14,padding:16,cursor:"pointer",textAlign:"left",
             boxShadow:"0 2px 8px rgba(0,0,0,0.06)",position:"relative",display:"flex",flexDirection:"column",gap:4 },
  menuIcon:{ fontSize:28,marginBottom:4 },
  menuLabel:{ fontSize:14,fontWeight:800,color:C.text },
  menuDesc: { fontSize:11,color:C.textMuted,fontWeight:600 },
  menuArr:  { position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:22,color:C.textMuted },
  annSection:{ padding:"0 16px" },
  annTitle: { fontSize:13,fontWeight:800,color:C.text,marginBottom:10,textTransform:"uppercase",letterSpacing:0.5 },
  annCard:  { background:"#fff",borderRadius:12,marginBottom:8,display:"flex",overflow:"hidden",
              boxShadow:"0 1px 6px rgba(0,0,0,0.05)" },
  annStripe:{ width:4 },
  annHead:  { fontSize:13,fontWeight:700,color:C.text,marginBottom:4 },
  annBody:  { fontSize:12,color:C.textSub,lineHeight:1.55 },
  annDate:  { fontSize:10,color:C.textMuted,marginTop:6 },
};

const R = {
  wrap:   { padding:24 },
  header: { display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 },
  title:  { fontSize:22,fontWeight:900,color:C.text },
  printBtn:{ background:C.primary,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",
             cursor:"pointer",fontWeight:700,fontSize:12 },
  metaRow:{ display:"flex",gap:12,flexWrap:"wrap",marginBottom:16 },
  meta:   { background:"#fff",borderRadius:10,padding:"10px 14px",flex:1,minWidth:130,
            boxShadow:"0 1px 4px rgba(0,0,0,0.05)" },
  metaKey:{ fontSize:9,fontWeight:800,color:C.textMuted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:3 },
  metaVal:{ fontSize:13,fontWeight:700,color:C.text },
  tableWrap:{ background:"#fff",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",marginBottom:16 },
  table:  { borderCollapse:"collapse",width:"100%",fontSize:13 },
  th:     { background:C.primary,color:"#fff",padding:"10px 14px",textAlign:"left",fontWeight:800,fontSize:11 },
  td:     { padding:"10px 14px",borderBottom:`1px solid ${C.border}`,textAlign:"left" },
  summaryRow:{ display:"flex",gap:10,flexWrap:"wrap" },
  sumCard:{ flex:1,minWidth:100,background:"#fff",borderRadius:12,padding:"16px",textAlign:"center",
            boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  sumVal: { fontSize:24,fontWeight:900,color:C.text,marginBottom:4 },
  sumKey: { fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:0.8 },
};

const SJ = {
  wrap:  { padding:24 },
  title: { fontSize:22,fontWeight:900,color:C.text,marginBottom:16 },
  grid:  { display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16 },
  card:  { background:"#fff",borderRadius:16,padding:18,boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  cardTop:{ display:"flex",gap:12,alignItems:"flex-start",marginBottom:14 },
  iconBox:{ width:52,height:52,borderRadius:14,background:`${C.primary}15`,
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 },
  subjName:{ fontSize:15,fontWeight:800,color:C.text,marginBottom:4 },
  subjTeacher:{ fontSize:12,color:C.textMuted },
  gradeBadge:{ borderRadius:8,padding:"4px 10px",fontSize:13,fontWeight:900,flexShrink:0 },
  progLabel:{ display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:700,
              color:C.textSub,marginBottom:6 },
  progBg:  { height:7,background:C.border,borderRadius:4,overflow:"hidden",marginBottom:8 },
  progFill:{ height:"100%",borderRadius:4,transition:"width 0.5s" },
  score:   { fontSize:12,color:C.textSub,fontWeight:600 },
};

const TT = {
  wrap:   { padding:24 },
  title:  { fontSize:22,fontWeight:900,color:C.text,marginBottom:16 },
  dayTabs:{ display:"flex",gap:8,marginBottom:20,flexWrap:"wrap" },
  dayTab: { padding:"8px 18px",borderRadius:20,border:`1.5px solid ${C.border}`,
            background:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,color:C.textSub },
  dayTabOn:{ background:C.primary,borderColor:C.primary,color:"#fff" },
  empty:  { textAlign:"center",padding:40,color:C.textMuted,fontSize:14 },
  periodRow:{ background:"#fff",borderRadius:14,marginBottom:10,display:"flex",gap:0,overflow:"hidden",
              boxShadow:"0 2px 8px rgba(0,0,0,0.05)" },
  timeBox:{ background:C.primary,padding:"14px 16px",display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",minWidth:80 },
  timeStart:{ fontSize:11,fontWeight:800,color:"#fff" },
  timeSep:  { fontSize:9,color:"rgba(255,255,255,0.5)" },
  timeEnd:  { fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.8)" },
  periodInfo:{ padding:"14px 18px",flex:1 },
  periodSubj:{ fontSize:15,fontWeight:800,color:C.text,marginBottom:5 },
  periodMeta:{ fontSize:12,color:C.textMuted },
};

const AN = {
  card:  { background:"#fff",borderRadius:14,marginBottom:12,display:"flex",overflow:"hidden",
           boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  stripe:{ width:5 },
  body:  { flex:1,padding:"16px 18px" },
  meta:  { display:"flex",gap:10,alignItems:"center",marginBottom:8 },
  cat:   { fontSize:10,fontWeight:800,letterSpacing:1,padding:"3px 10px",borderRadius:6,textTransform:"uppercase" },
  date:  { fontSize:11,color:C.textMuted,marginLeft:"auto" },
  title: { fontSize:16,fontWeight:800,color:C.text,marginBottom:8 },
  text:  { fontSize:13,color:C.textSub,lineHeight:1.65,marginBottom:8 },
  author:{ fontSize:11,color:C.textMuted,fontStyle:"italic" },
};

const PF = {
  wrap:   { padding:24,maxWidth:500,margin:"0 auto" },
  heroCard:{ background:`linear-gradient(135deg,${C.primaryDark},${C.primary})`,borderRadius:20,
             padding:"32px 24px",textAlign:"center",marginBottom:20,
             boxShadow:"0 8px 32px rgba(0,137,123,0.25)" },
  avatar: { fontSize:64,marginBottom:12 },
  name:   { fontSize:22,fontWeight:900,color:"#fff",marginBottom:6 },
  sub:    { fontSize:12,color:"rgba(255,255,255,0.75)",marginBottom:2 },
  savedAlert:{ background:"#E8F5E9",border:"1px solid #A5D6A7",borderRadius:10,padding:"12px 16px",
               fontSize:13,color:C.success,fontWeight:700,marginBottom:16 },
  infoCard:{ background:"#fff",borderRadius:16,overflow:"hidden",
             boxShadow:"0 2px 8px rgba(0,0,0,0.06)",marginBottom:20 },
  infoCardTitle:{ padding:"14px 18px",fontSize:12,fontWeight:800,color:C.textMuted,
                  textTransform:"uppercase",letterSpacing:0.8,borderBottom:`1px solid ${C.border}` },
  infoRow:{ display:"flex",alignItems:"center",gap:14,padding:"14px 18px",borderBottom:`1px solid ${C.border}` },
  infoIcon:{ fontSize:20,width:28,textAlign:"center" },
  infoLabel:{ fontSize:10,fontWeight:800,color:C.textMuted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3 },
  infoValue:{ fontSize:14,fontWeight:600,color:C.text },
  infoInput:{ width:"100%",border:`1.5px solid ${C.primary}`,borderRadius:8,padding:"6px 10px",
              fontSize:14,outline:"none",fontFamily:"'Plus Jakarta Sans',sans-serif" },
  btnRow: { display:"flex",gap:10,flexWrap:"wrap" },
  editBtn:{ flex:1,background:C.primary,color:"#fff",border:"none",borderRadius:12,height:46,
            cursor:"pointer",fontWeight:800,fontSize:14 },
  saveBtn:{ flex:1,background:C.success,color:"#fff",border:"none",borderRadius:12,height:46,
            cursor:"pointer",fontWeight:800,fontSize:14 },
  cancelBtn:{ background:C.border,border:"none",borderRadius:12,height:46,padding:"0 18px",
              cursor:"pointer",fontWeight:700,fontSize:13,color:C.text },
  logoutBtn:{ background:C.danger,color:"#fff",border:"none",borderRadius:12,height:46,padding:"0 18px",
              cursor:"pointer",fontWeight:800,fontSize:14 },
};
