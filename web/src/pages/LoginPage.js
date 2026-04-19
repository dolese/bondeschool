import { useState } from "react";
import { C } from "../theme";
import { api } from "../api";

export default function LoginPage({ onLogin, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPw,   setShowPw]   = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError("Please enter username and password"); return; }
    setLoading(true); setError("");
    try {
      const data = await api.login({ username: username.trim(), password: password.trim() });
      localStorage.setItem("token", data.token);
      onLogin(data);
    } catch (err) {
      setError(err.message ?? "Invalid credentials");
    } finally { setLoading(false); }
  };

  return (
    <div style={S.root}>
      <div style={S.left}>
        <button onClick={onBack} style={S.backBtn}>← Back to Website</button>
        <div style={S.brand}>
          <span style={S.brandLogo}>🎓</span>
          <div>
            <div style={S.brandName}>BONDE Secondary School</div>
            <div style={S.brandTag}>SmartSchool TZ</div>
          </div>
        </div>
        <h1 style={S.heading}>Welcome Back</h1>
        <p style={S.sub}>Sign in to access your student portal or admin dashboard.</p>

        <form onSubmit={handle} style={S.form}>
          {error && <div style={S.errorBox}>⚠️ {error}</div>}

          <label style={S.label}>Username / Admission Number</label>
          <div style={S.inputWrap}>
            <span style={S.inputIcon}>👤</span>
            <input value={username} onChange={e=>setUsername(e.target.value)}
              placeholder="e.g. john.mwambo or 20456"
              style={S.input} autoComplete="username" autoFocus/>
          </div>

          <label style={S.label}>Password</label>
          <div style={S.inputWrap}>
            <span style={S.inputIcon}>🔒</span>
            <input value={password} onChange={e=>setPassword(e.target.value)}
              type={showPw?"text":"password"} placeholder="Enter password"
              style={{...S.input, flex:1}} autoComplete="current-password"/>
            <button type="button" onClick={()=>setShowPw(p=>!p)} style={S.eyeBtn}>
              {showPw?"🙈":"👁️"}
            </button>
          </div>

          <button type="submit" style={{...S.loginBtn, opacity:loading?0.7:1}} disabled={loading}>
            {loading ? "Signing in…" : "Login →"}
          </button>
        </form>

        <div style={S.demoBox}>
          <div style={S.demoTitle}>🔑 Demo Accounts</div>
          <div style={S.demoGrid}>
            {[["👨‍🎓 Student","john.mwambo","student123"],["👨‍💼 Admin","admin","admin123"]].map(([r,u,p])=>(
              <button key={r} style={S.demoBtn} onClick={()=>{setUsername(u);setPassword(p);}}>
                <div style={S.demoBtnRole}>{r}</div>
                <div style={S.demoBtnCred}>{u}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={S.right}>
        <div style={S.rightContent}>
          <div style={{fontSize:72,marginBottom:24}}>🎓</div>
          <h2 style={S.rightH2}>SmartSchool TZ</h2>
          <p style={S.rightP}>Access your grades, timetable, subjects and announcements from anywhere, anytime.</p>
          <div style={S.featureList}>
            {[["📊","View Results & Division"],["📚","Browse Subjects & Progress"],["📅","Check Weekly Timetable"],["📢","School Announcements"],["📋","Individual Report Cards"],["👤","Manage Your Profile"]].map(([icon,label])=>(
              <div key={label} style={S.featureItem}>
                <span style={{fontSize:18}}>{icon}</span>
                <span style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.85)"}}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  root:    { display:"flex", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif" },
  left:    { flex:1, padding:"40px 48px", display:"flex", flexDirection:"column",
             background:"#fff", maxWidth:520, overflowY:"auto" },
  right:   { flex:1, background:`linear-gradient(135deg, #00695C 0%, #00897B 50%, #4DB6AC 100%)`,
             display:"flex", alignItems:"center", justifyContent:"center", padding:48, position:"relative", overflow:"hidden" },
  rightContent:{ position:"relative", zIndex:1, textAlign:"center" },
  rightH2: { fontSize:32, fontWeight:900, color:"#fff", marginBottom:12 },
  rightP:  { color:"rgba(255,255,255,0.8)", fontSize:15, lineHeight:1.7, marginBottom:32 },
  featureList:{ display:"flex", flexDirection:"column", gap:12, textAlign:"left" },
  featureItem:{ display:"flex", gap:12, alignItems:"center", background:"rgba(255,255,255,0.1)",
                borderRadius:10, padding:"10px 16px", backdropFilter:"blur(4px)" },

  backBtn: { background:"none", border:"none", color:"#00897B", cursor:"pointer", fontSize:13,
             fontWeight:700, padding:0, marginBottom:32, alignSelf:"flex-start" },
  brand:   { display:"flex", alignItems:"center", gap:12, marginBottom:36 },
  brandLogo:{ fontSize:32 },
  brandName:{ fontWeight:900, fontSize:14, color:"#1A2332" },
  brandTag: { fontSize:10, color:"#00897B", fontWeight:700, letterSpacing:1, textTransform:"uppercase" },
  heading: { fontSize:32, fontWeight:900, color:"#1A2332", marginBottom:8 },
  sub:     { fontSize:14, color:"#4A5568", marginBottom:28, lineHeight:1.6 },

  form:     { display:"flex", flexDirection:"column", gap:4 },
  label:    { fontSize:11, fontWeight:800, color:"#8A99AE", textTransform:"uppercase", letterSpacing:0.8, marginBottom:6, marginTop:12 },
  inputWrap:{ display:"flex", alignItems:"center", border:"1.5px solid #E2EAF0", borderRadius:12,
              background:"#F8FAFC", padding:"0 14px", marginBottom:4 },
  inputIcon:{ fontSize:16, marginRight:10 },
  input:    { height:50, border:"none", background:"transparent", outline:"none", fontSize:14,
              color:"#1A2332", flex:1, fontFamily:"'Plus Jakarta Sans',sans-serif" },
  eyeBtn:   { background:"none", border:"none", cursor:"pointer", fontSize:18, padding:"0 4px" },
  loginBtn: { marginTop:20, background:"#00897B", color:"#fff", border:"none", borderRadius:12,
              height:52, fontSize:15, fontWeight:800, cursor:"pointer", letterSpacing:0.3 },
  errorBox: { background:"#FFF3F3", border:"1px solid #FFCDD2", borderRadius:10, padding:"12px 16px",
              fontSize:13, color:"#C62828", fontWeight:600, marginBottom:4 },

  demoBox:  { marginTop:24, background:"#F0FDF9", border:"1px solid #B2DFDB", borderRadius:14, padding:16 },
  demoTitle:{ fontSize:11, fontWeight:800, color:"#00695C", textTransform:"uppercase", letterSpacing:0.8, marginBottom:12 },
  demoGrid: { display:"flex", gap:10 },
  demoBtn:  { flex:1, background:"#fff", border:"1.5px solid #B2DFDB", borderRadius:10, padding:"10px 14px",
              cursor:"pointer", textAlign:"left" },
  demoBtnRole:{ fontSize:12, fontWeight:700, color:"#00897B", marginBottom:3 },
  demoBtnCred:{ fontSize:11, color:"#4A5568", fontFamily:"'DM Mono',monospace" },
};
