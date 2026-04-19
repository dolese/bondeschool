import { useState, useEffect } from "react";
import { api } from "./api";
import Homepage from "./pages/Homepage";
import LoginPage from "./pages/LoginPage";
import { StudentPortal } from "./pages/StudentPortal";
import { AdminPortal } from "./pages/AdminPortal";

export default function App() {
  const [view, setView]   = useState("home"); // home | login | portal
  const [user, setUser]   = useState(null);
  const [role, setRole]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate session on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    api.me()
      .then(u => { setUser(u); setRole(u.role ?? "student"); setView("portal"); })
      .catch(() => { localStorage.removeItem("token"); })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = (data) => {
    setUser(data.user);
    setRole(data.role);
    setView("portal");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null); setRole(null); setView("home");
  };

  if (loading) {
    return (
      <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center",
                    flexDirection:"column", gap:16, background:"#00897B" }}>
        <div style={{ fontSize:60 }}>🎓</div>
        <div style={{ color:"#fff", fontWeight:900, fontSize:22, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>SmartSchool TZ</div>
        <div style={{ color:"rgba(255,255,255,0.7)", fontSize:14, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Loading…</div>
      </div>
    );
  }

  if (view === "home") return (
    <Homepage onLogin={() => setView("login")} />
  );

  if (view === "login") return (
    <LoginPage onLogin={handleLogin} onBack={() => setView("home")} />
  );

  if (view === "portal") {
    const isAdmin = role === "admin" || role === "teacher";
    return isAdmin
      ? <AdminPortal user={user} onLogout={handleLogout} />
      : <StudentPortal user={user} onLogout={handleLogout} />;
  }

  return null;
}
