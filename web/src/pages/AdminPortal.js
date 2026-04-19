import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { api } from "../api";
import { C, GRADE_C, GRADE_B, DIV_C, getGrade, gp, getDiv } from "../theme";

// ── Compute helpers ───────────────────────────────────────────────────────────
function computeStudent(s, subjects) {
  if(s.status!=="present") return {...s,grades:[],total:null,avg:null,agrd:null,div:null,points:null,posn:null};
  const grades=(s.scores||[]).map((sc,i)=>({subj:subjects[i]??`S${i+1}`,score:sc===""?null:Number(sc),grade:getGrade(sc)}));
  const valid=grades.filter(g=>g.grade!==null);
  if(!valid.length) return {...s,grades,total:null,avg:null,agrd:null,div:null,points:null,posn:null};
  const total=valid.reduce((a,g)=>a+g.score,0);
  const avg=total/valid.length;
  const agrd=getGrade(avg);
  const pts=[...valid].sort((a,b)=>gp(a.grade)-gp(b.grade)).slice(0,7).reduce((a,g)=>a+gp(g.grade),0);
  return {...s,grades,total,avg:Number(avg.toFixed(1)),agrd,div:getDiv(pts),points:pts};
}
function withPositions(students,subjects){
  const raw=students.map(s=>computeStudent(s,subjects));
  const ranked=[...raw].filter(s=>s.total!==null).sort((a,b)=>b.total-a.total);
  ranked.forEach((s,i)=>{s.posn=i+1;});
  const pm=Object.fromEntries(ranked.map(s=>[s.id,s.posn]));
  return raw.map(s=>({...s,posn:pm[s.id]??null}));
}

// ── ADMIN SHELL ───────────────────────────────────────────────────────────────
export function AdminPortal({ user, onLogout }) {
  const [page,setPage]      = useState("dashboard");
  const [classes,setClasses]= useState([]);
  const [activeId,setActiveId]= useState(null);
  const [sideOpen,setSideOpen]= useState(true);
  const [toast,setToast]    = useState(null);

  const showToast = (msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),2500);};

  useEffect(()=>{
    api.getClasses().then(d=>{setClasses(d);if(d.length)setActiveId(d[0].id);}).catch(()=>{});
  },[]);

  const activeClass = classes.find(c=>c.id===activeId)??classes[0];

  const refreshClass = useCallback(async id=>{
    try{ const f=await api.getClass(id); setClasses(p=>p.map(c=>c.id===id?f:c)); }catch{}
  },[]);

  const addClass = async()=>{
    try{
      const def={name:"BONDE Secondary School",authority:"PRIME MINISTER'S OFFICE",
        region:"KIGOMA",district:"KIGOMA MUNICIPAL",form:"FORM THREE",term:"MID-TERM",year:"2026"};
      const c=await api.createClass({name:`Class ${classes.length+1}`,schoolInfo:def,
        subjects:["Mathematics","English","Biology","History","Kiswahili","Geography","Civics","Physics","Chemistry"],
        form:"Form IV",stream:"A"});
      setClasses(p=>[...p,{...c,students:[]}]);setActiveId(c.id);setPage("class");
    }catch(e){showToast(e.message,"error");}
  };

  const deleteClass = async id=>{
    if(!window.confirm("Delete this class and all its students?"))return;
    await api.deleteClass(id);
    setClasses(p=>p.filter(c=>c.id!==id));
    showToast("Class deleted");
  };

  const allComputed = useMemo(()=>classes.map(cl=>({...cl,computed:withPositions(cl.students??[],cl.subjects??[])})),[classes]);

  const NAV=[
    {id:"dashboard",icon:"📊",label:"Dashboard"},
    {id:"class",icon:"📋",label:"Classes"},
    {id:"announcements",icon:"📢",label:"Announcements"},
    {id:"students",icon:"👥",label:"All Students"},
  ];

  return(
    <div style={A.root}>
      {toast&&<div style={{...A.toast,background:toast.type==="error"?C.danger:C.success}}>{toast.type==="error"?"❌":"✅"} {toast.msg}</div>}

      <aside style={{...A.sidebar,width:sideOpen?240:0,overflow:"hidden",transition:"width 0.25s"}}>
        <div style={A.sideInner}>
          <div style={A.sideLogo}>
            <span style={{fontSize:28}}>🎓</span>
            <div><div style={A.sideTitle}>SmartSchool TZ</div><div style={A.sideSub}>Admin Portal</div></div>
          </div>

          <div style={A.sideProfile}>
            <div style={{fontSize:24}}>👨‍💼</div>
            <div><div style={A.sideUser}>{user.fullName}</div><div style={A.sideRole}>{user.role?.toUpperCase()}</div></div>
          </div>

          <nav style={A.nav}>
            {NAV.map(n=>(
              <button key={n.id} onClick={()=>setPage(n.id)}
                style={{...A.navItem,...(page===n.id?A.navOn:{})}}>
                <span>{n.icon}</span><span>{n.label}</span>
              </button>
            ))}
          </nav>

          <div style={A.sideSection}>CLASSES</div>
          <div style={A.classList}>
            {classes.map(cl=>(
              <div key={cl.id} style={{...A.clItem,...(cl.id===activeId&&page==="class"?A.clOn:{})}}>
                <span style={A.clName} onClick={()=>{setActiveId(cl.id);setPage("class");}}>
                  📋 {cl.name} <span style={A.clCount}>{cl.studentCount??cl.students?.length??0}</span>
                </span>
                <button style={A.clDel} onClick={()=>deleteClass(cl.id)}>🗑</button>
              </div>
            ))}
          </div>
          <button onClick={addClass} style={A.addClBtn}>+ New Class</button>
          <button onClick={onLogout} style={A.logoutBtn}>🚪 Logout</button>
        </div>
      </aside>

      <div style={A.main}>
        <div style={A.topBar}>
          <button style={A.menuBtn} onClick={()=>setSideOpen(p=>!p)}>☰</button>
          <span style={A.topBrand}>Admin Panel — {user.fullName}</span>
        </div>

        <div style={A.content}>
          {page==="dashboard"    && <AdminDashboard allComputed={allComputed} onOpen={id=>{setActiveId(id);setPage("class");}}/>}
          {page==="class"        && activeClass && <ClassWorkspace key={activeClass.id} cls={activeClass} setClasses={setClasses} refreshClass={refreshClass} showToast={showToast}/>}
          {page==="announcements"&& <AnnouncementsAdmin showToast={showToast}/>}
          {page==="students"     && <AllStudentsView allComputed={allComputed}/>}
        </div>
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
function AdminDashboard({ allComputed, onOpen }) {
  const all=allComputed.flatMap(c=>c.computed??[]);
  const pres=all.filter(s=>s.status==="present"&&s.total!==null);
  const divC=d=>pres.filter(s=>s.div===d).length;
  const top5=[...pres].sort((a,b)=>b.total-a.total).slice(0,5);
  const classMap=Object.fromEntries(allComputed.map(c=>[c.id,c.name]));
  const pass=pres.length?Math.round(pres.filter(s=>s.div!=="0").length/pres.length*100):0;

  return(
    <div style={{padding:24}}>
      <h2 style={D.title}>📊 School Dashboard</h2>
      <div style={D.kpiRow}>
        {[["🏫","Classes",allComputed.length,C.primary],["👥","Students",all.length,C.info],
          ["✅","Present",pres.length,C.success],["🏆","Div I",divC("I"),"#b8860b"],
          ["📈","Pass Rate",pass+"%",C.primary]].map(([icon,label,val,color])=>(
          <div key={label} style={{...D.kpi,borderLeft:`4px solid ${color}`}}>
            <div style={{fontSize:22}}>{icon}</div>
            <div style={{fontSize:26,fontWeight:900,color}}>{val}</div>
            <div style={{fontSize:10,color:C.textMuted,fontWeight:700,textTransform:"uppercase"}}>{label}</div>
          </div>
        ))}
      </div>

      <div style={D.grid}>
        <div style={{...D.card,gridColumn:"span 2"}}>
          <h3 style={D.cardTitle}>🏫 Classes</h3>
          <table style={D.tbl}>
            <thead><tr style={{background:C.primary,color:"#fff"}}>
              {["Class","Students","Div I","Div II","Pass%","Top Student",""].map(h=><th key={h} style={D.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {allComputed.map((cl,ri)=>{
                const pr=(cl.computed??[]).filter(s=>s.status==="present"&&s.total!==null);
                const ps=pr.length?Math.round(pr.filter(s=>s.div!=="0").length/pr.length*100):0;
                const top=[...pr].sort((a,b)=>b.total-a.total)[0];
                return(
                  <tr key={cl.id} style={{background:ri%2===0?"#fff":C.bg}}>
                    <td style={{...D.td,fontWeight:700,color:C.primary}}>{cl.name}</td>
                    <td style={D.td}>{cl.students?.length??0}</td>
                    <td style={{...D.td,color:DIV_C["I"],fontWeight:700}}>{pr.filter(s=>s.div==="I").length}</td>
                    <td style={{...D.td,color:DIV_C["II"],fontWeight:700}}>{pr.filter(s=>s.div==="II").length}</td>
                    <td style={{...D.td,fontWeight:700,color:ps>=50?C.success:C.danger}}>{ps}%</td>
                    <td style={{...D.td,fontSize:11}}>{top?.fullName??"-"}</td>
                    <td style={D.td}><button onClick={()=>onOpen(cl.id)} style={D.openBtn}>Open</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={D.card}>
          <h3 style={D.cardTitle}>📊 Division Chart</h3>
          <div style={{display:"flex",alignItems:"flex-end",gap:14,height:130,justifyContent:"center",marginTop:12}}>
            {["I","II","III","IV","0"].map(div=>{
              const count=divC(div); const max=Math.max(...["I","II","III","IV","0"].map(d=>divC(d)),1);
              return(
                <div key={div} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <span style={{fontSize:12,fontWeight:700,color:DIV_C[div]}}>{count}</span>
                  <div style={{width:36,borderRadius:"4px 4px 0 0",background:DIV_C[div],height:Math.max(count/max*90,4),transition:"height 0.5s"}}/>
                  <span style={{fontSize:10,fontWeight:700,color:DIV_C[div]}}>Div {div}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={D.card}>
          <h3 style={D.cardTitle}>🏆 Top Students</h3>
          {top5.map((s,i)=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:16,width:24}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}.`}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{s.fullName}</div>
                <div style={{fontSize:11,color:C.textMuted}}>{classMap[allComputed.find(c=>c.computed?.includes(s))?.id]}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:800,color:C.text}}>{s.total}</div>
                <div style={{fontSize:10,fontWeight:700,color:DIV_C[s.div]}}>Div {s.div}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CLASS WORKSPACE ───────────────────────────────────────────────────────────
function ClassWorkspace({ cls, setClasses, refreshClass, showToast }) {
  const [tab,setTab]     = useState("entry");
  const [search,setSearch]=useState("");
  const debRef           = useRef({});

  const students = cls.students??[];
  const subjects = cls.subjects??[];
  const computed = useMemo(()=>withPositions(students,subjects),[students,subjects]);
  const filtered = useMemo(()=>{
    const q=search.trim().toLowerCase();
    return q?computed.filter(s=>s.fullName?.toLowerCase().includes(q)||s.admissionNo?.toLowerCase().includes(q)||s.div===q.toUpperCase()):computed;
  },[computed,search]);

  const stats=useMemo(()=>{
    const pres=computed.filter(s=>s.status==="present"&&s.total!==null);
    const abs=computed.filter(s=>s.status==="absent");
    const inc=computed.filter(s=>s.status==="incomplete");
    const bySex=(l,sx)=>l.filter(s=>s.sex===sx);
    const divC=(l,d)=>l.filter(s=>s.div===d).length;
    const grdC=(l,g)=>l.filter(s=>s.agrd===g).length;
    const subjGrades=subjects.map((_,si)=>{const c={A:0,B:0,C:0,D:0,F:0};pres.forEach(s=>{const g=s.grades?.[si]?.grade;if(g)c[g]++;});return c;});
    return{pres,abs,inc,bySex,divC,grdC,subjGrades,total:computed.length};
  },[computed,subjects]);

  const deb=(k,fn,d=600)=>{clearTimeout(debRef.current[k]);debRef.current[k]=setTimeout(fn,d);};
  const upd=patch=>setClasses(p=>p.map(c=>c.id===cls.id?{...c,...patch}:c));
  const updSI=(k,v)=>{const si={...cls.schoolInfo,[k]:v};upd({schoolInfo:si});deb(`si${cls.id}`,()=>api.updateClass(cls.id,{schoolInfo:si}).catch(e=>showToast(e.message,"error")));};

  const addStudent=async()=>{
    const last=students[students.length-1];
    const admissionNo=last?String(Number(last.admissionNo||0)+1).padStart(5,"0"):"20001";
    try{
      const s=await api.addStudent(cls.id,{admissionNo,fullName:"",sex:"M",status:"present",password:"student123",scores:Array(subjects.length).fill("")});
      upd({students:[...(cls.students??[]),s],studentCount:(cls.studentCount??0)+1});
    }catch(e){showToast(e.message,"error");}
  };

  const remStudent=async sid=>{
    upd({students:(cls.students??[]).filter(s=>s.id!==sid),studentCount:Math.max(0,(cls.studentCount??1)-1)});
    try{await api.deleteStudent(cls.id,sid);}catch(e){showToast(e.message,"error");refreshClass(cls.id);}
  };

  const updStudent=(sid,field,val)=>{
    upd({students:(cls.students??[]).map(s=>s.id===sid?{...s,[field]:val}:s)});
    deb(`st${sid}${field}`,()=>api.updateStudent(cls.id,sid,{[field]:val}).catch(e=>showToast(e.message,"error")));
  };

  const updScore=(sid,si,raw)=>{
    const val=raw===""?"":Math.min(100,Math.max(0,Number(raw)));
    setClasses(p=>p.map(c=>{if(c.id!==cls.id)return c;return{...c,students:(c.students??[]).map(s=>{if(s.id!==sid)return s;const sc=[...s.scores];sc[si]=val;return{...s,scores:sc};})};;}));
    const st=students.find(s=>s.id===sid);if(!st)return;
    const ns=[...st.scores];ns[si]=val;
    deb(`sc${sid}${si}`,()=>api.updateStudent(cls.id,sid,{scores:ns}).catch(e=>showToast(e.message,"error")));
  };

  const setSubjects=async ns=>{
    try{await api.updateClass(cls.id,{subjects:ns});await refreshClass(cls.id);}catch(e){showToast(e.message,"error");}
  };

  const exportJSON=()=>{
    const blob=new Blob([JSON.stringify({...cls,students:computed},null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${cls.name}.json`;a.click();
  };

  const TABS=[["entry","📝 Entry"],["sheet","📄 Result Sheet"]];

  return(
    <div style={CW.wrap}>
      <div style={CW.tabBar} className="no-print">
        <div style={{display:"flex"}}>{TABS.map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{...CW.tab,...(tab===t?CW.tabOn:{})}}>
            {l}
          </button>
        ))}</div>
        <div style={{display:"flex",gap:8,marginLeft:"auto",alignItems:"center"}}>
          <button onClick={exportJSON} style={CW.toolBtn}>⬇️ Export</button>
        </div>
      </div>

      {tab==="entry" && (
        <div style={{overflowY:"auto",flex:1}}>
          <EntryPanel cls={cls} computed={computed} filtered={filtered}
            search={search} setSearch={setSearch}
            updSI={updSI} addStudent={addStudent} remStudent={remStudent}
            updStudent={updStudent} updScore={updScore}
            addSubject={()=>setSubjects([...subjects,"NEW"])}
            remSubject={si=>setSubjects(subjects.filter((_,i)=>i!==si))}
            renSubject={(si,v)=>setSubjects(subjects.map((s,i)=>i===si?v:s))}/>
        </div>
      )}
      {tab==="sheet" && <ResultSheet cls={cls} computed={computed} stats={stats}/>}
    </div>
  );
}

// ── ENTRY PANEL ───────────────────────────────────────────────────────────────
function EntryPanel({ cls, computed, filtered, search, setSearch, updSI, addStudent, remStudent, updStudent, updScore, addSubject, remSubject, renSubject }) {
  const [eSubjIdx,setESubjIdx]=useState(null);
  const [eSubjVal,setESubjVal]=useState("");
  const subjects=cls.subjects??[];
  const si=cls.schoolInfo??{};
  const fld=(k,lbl,w="200px")=>(
    <label style={EP.fld}>
      <span style={EP.lbl}>{lbl}</span>
      <input value={si[k]??""} style={{...EP.inp,width:w}} onChange={e=>updSI(k,e.target.value)}/>
    </label>
  );
  return(
    <div style={EP.wrap}>
      <div style={EP.strip}>
        {[["👥 Students",computed.length,C.primary],["✅ Present",computed.filter(s=>s.status==="present").length,C.success],["🏆 Div I",computed.filter(s=>s.div==="I").length,"#b8860b"],["📚 Subjects",subjects.length,"#5a2d82"]].map(([l,v,c])=>(
          <div key={l} style={{...EP.statCard,borderTop:`3px solid ${c}`}}>
            <div style={{fontSize:22,fontWeight:900,color:c}}>{v}</div>
            <div style={{fontSize:9,color:C.textMuted,fontWeight:700,textTransform:"uppercase"}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={EP.card}>
        <h3 style={EP.cardT}>🏫 School Information</h3>
        <div style={EP.row}>{fld("name","School Name","260px")}{fld("authority","Authority","220px")}{fld("region","Region","120px")}{fld("district","District","200px")}</div>
        <div style={EP.row}>{fld("form","Form","120px")}{fld("term","Assessment","200px")}{fld("year","Year","90px")}</div>
      </div>
      <div style={EP.card}>
        <h3 style={EP.cardT}>📚 Subjects ({subjects.length}) <span style={{fontSize:10,fontWeight:400,color:C.textMuted}}>click to rename</span></h3>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {subjects.map((s,i)=>(
            <div key={i} style={EP.subjChip}>
              {eSubjIdx===i?<input autoFocus value={eSubjVal} style={EP.subjInp}
                onChange={e=>setESubjVal(e.target.value)}
                onBlur={()=>{ renSubject(i,eSubjVal); setESubjIdx(null); }}
                onKeyDown={e=>{ if(e.key==="Enter"){renSubject(i,eSubjVal);setESubjIdx(null);} if(e.key==="Escape")setESubjIdx(null); }}/>
              :<span style={EP.subjName} onClick={()=>{setESubjIdx(i);setESubjVal(s);}}>{s}</span>}
              <button onClick={()=>remSubject(i)} style={EP.subjX}>×</button>
            </div>
          ))}
          <button onClick={addSubject} style={EP.addBtn}>+ Add</button>
        </div>
      </div>
      <div style={EP.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
          <h3 style={{...EP.cardT,marginBottom:0}}>👥 Students</h3>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={EP.searchBox}>
              <span>🔍</span>
              <input placeholder="Search name, admission, div…" value={search} onChange={e=>setSearch(e.target.value)} style={EP.searchInp}/>
              {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",color:C.textMuted,fontSize:16}}>×</button>}
            </div>
            <button onClick={addStudent} style={EP.addBtn}>+ Add Student</button>
          </div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={EP.tbl}>
            <thead><tr>
              <th style={EP.th}>#</th>
              <th style={EP.th}>Adm No</th>
              <th style={{...EP.th,minWidth:180}}>Full Name</th>
              <th style={EP.th}>Sex</th>
              <th style={EP.th}>Status</th>
              {subjects.map((s,i)=><th key={i} style={{...EP.th,minWidth:52,fontSize:9}}>{s}</th>)}
              <th style={EP.th}>Total</th><th style={EP.th}>Avg</th>
              <th style={EP.th}>Grd</th><th style={EP.th}>Div</th>
              <th style={EP.th}>Pts</th><th style={EP.th}>Pos</th>
              <th style={EP.th}></th>
            </tr></thead>
            <tbody>
              {(search?filtered:computed).map((st,ri)=>{
                const isAbs=st.status==="absent",isInc=st.status==="incomplete";
                const hl=search&&filtered.includes(st);
                return(
                  <tr key={st.id} style={{background:hl?"#fffbe6":ri%2===0?"#fff":C.bg,outline:hl?"2px solid #f0c040":"none"}}>
                    <td style={{...EP.td,color:"#ccc",fontSize:9}}>{ri+1}</td>
                    <td style={EP.td}><input value={st.admissionNo??""} style={{...EP.cIn,width:58}} onChange={e=>updStudent(st.id,"admissionNo",e.target.value)}/></td>
                    <td style={EP.td}><input value={st.fullName??""} placeholder="Full Name" style={{...EP.cIn,width:178}} onChange={e=>updStudent(st.id,"fullName",e.target.value)}/></td>
                    <td style={EP.td}><select value={st.sex} style={EP.cSel} onChange={e=>updStudent(st.id,"sex",e.target.value)}><option>M</option><option>F</option></select></td>
                    <td style={EP.td}><select value={st.status} style={EP.cSel} onChange={e=>updStudent(st.id,"status",e.target.value)}><option value="present">Present</option><option value="absent">Absent</option><option value="incomplete">Incomplete</option></select></td>
                    {subjects.map((_,si)=>(
                      <td key={si} style={EP.td}>
                        <input type="number" min={0} max={100} disabled={isAbs||isInc}
                          value={st.scores?.[si]??""}
                          style={{...EP.cIn,width:46,background:isAbs||isInc?"#eee":(st.scores?.[si]!==""?GRADE_B[getGrade(st.scores?.[si])]??"#fff":"#fff"),color:GRADE_C[getGrade(st.scores?.[si])]??"#222",fontWeight:getGrade(st.scores?.[si])==="A"?"700":"400"}}
                          onChange={e=>updScore(st.id,si,e.target.value)}/>
                      </td>
                    ))}
                    <td style={{...EP.td,fontWeight:700}}>{st.total!==null?st.total:isAbs?"ABS":isInc?"INC":"–"}</td>
                    <td style={EP.td}>{st.avg??"–"}</td>
                    <td style={{...EP.td,fontWeight:800,color:GRADE_C[st.agrd]}}>{st.agrd??"–"}</td>
                    <td style={{...EP.td,fontWeight:800,color:DIV_C[st.div]}}>{st.div??"–"}</td>
                    <td style={EP.td}>{st.points??"–"}</td>
                    <td style={{...EP.td,fontWeight:700}}>{st.posn??"–"}</td>
                    <td style={EP.td}><button onClick={()=>remStudent(st.id)} style={EP.delBtn}>✕</button></td>
                  </tr>
                );
              })}
              {!computed.length&&<tr><td colSpan={13+subjects.length} style={{...EP.td,color:"#bbb",padding:24,textAlign:"center"}}>No students yet</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{fontSize:10,color:C.textMuted,marginTop:8}}>🗄️ Changes auto-save to database</div>
      </div>
    </div>
  );
}

// ── RESULT SHEET ──────────────────────────────────────────────────────────────
function ResultSheet({ cls, computed, stats }) {
  const { pres, abs, inc, bySex, divC, grdC, subjGrades } = stats;
  const subjs=cls.subjects??[];
  const si=cls.schoolInfo??{};
  const F=l=>bySex(l,"F"),M=l=>bySex(l,"M");

  const divData={headers:["SEX","I","II","III","IV","0","TOTAL"],rows:[["F",...["I","II","III","IV","0"].map(d=>divC(F(pres),d)),F(pres).length],["M",...["I","II","III","IV","0"].map(d=>divC(M(pres),d)),M(pres).length],["TOTAL",...["I","II","III","IV","0"].map(d=>divC(pres,d)),pres.length]]};
  const grdData={headers:["SEX","A","B","C","D","F","TOTAL"],rows:[["F",...["A","B","C","D","F"].map(g=>grdC(F(pres),g)),F(pres).length],["M",...["A","B","C","D","F"].map(g=>grdC(M(pres),g)),M(pres).length],["TOTAL",...["A","B","C","D","F"].map(g=>grdC(pres,g)),pres.length]]};
  const attData={headers:["SEX","ABS","INC","PRSNT"],rows:[["F",F(abs).length,F(inc).length,F(pres).length],["M",M(abs).length,M(inc).length,M(pres).length],["TOTAL",abs.length,inc.length,pres.length]]};
  const divCounts={I:0,II:0,III:0,IV:0,"0":0};
  pres.forEach(s=>{if(s.div)divCounts[s.div]++;});

  return(
    <div style={{overflowY:"auto",flex:1,padding:16}}>
      <div style={{display:"flex",gap:10,marginBottom:12}} className="no-print">
        <button onClick={()=>window.print()} style={{background:C.primary,color:"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontWeight:800,cursor:"pointer",fontSize:13}}>🖨️ Print / Save PDF</button>
      </div>
      <div style={{background:"#fff",borderRadius:12,padding:20,boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
        <div style={{textAlign:"center",borderBottom:`3px solid ${C.primary}`,paddingBottom:10,marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:C.primary,letterSpacing:1}}>{si.authority}</div>
          <div style={{fontSize:10,color:C.textSub}}>{si.district}</div>
          <div style={{fontSize:20,fontWeight:900,color:C.primary,letterSpacing:2,textTransform:"uppercase"}}>{si.name}</div>
          <div style={{fontSize:11,fontWeight:700,color:C.textSub,marginTop:2}}>{si.form} {si.term} {si.year}</div>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
          <DivBarChart divCounts={divCounts}/>
          {[{label:"DIVISION",data:divData,color:C.primary},{label:"GRADE",data:grdData,color:C.success},{label:"ATTENDANCE",data:attData,color:C.danger}].map(({label,data,color})=>(
            <div key={label} style={{flex:1,minWidth:140,background:"#f7f9ff",border:"1px solid #d0dcf8",borderRadius:8,padding:"8px 6px",borderTop:`3px solid ${color}`}}>
              <div style={{fontSize:8,fontWeight:900,color,textTransform:"uppercase",letterSpacing:1,textAlign:"center",marginBottom:4}}>{label}</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{data.headers.map(h=><th key={h} style={{background:C.primary,color:"#fff",padding:"2px 4px",fontSize:8,textAlign:"center",border:"1px solid #224488"}}>{h}</th>)}</tr></thead>
                <tbody>{data.rows.map((row,i)=><tr key={i} style={{background:i%2===0?"#f7f9ff":"#eef2ff"}}>{row.map((cell,j)=><td key={j} style={{padding:"2px 4px",fontSize:8,textAlign:"center",border:"1px solid #dde5ff"}}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          ))}
        </div>

        <div style={{overflowX:"auto",marginBottom:6}}>
          <table style={{borderCollapse:"collapse",width:"100%",fontSize:9}}>
            <thead><tr style={{background:C.primary,color:"#fff"}}><th style={RS.shTh}></th>{subjs.map((s,i)=><th key={i} style={{...RS.shTh,minWidth:36,fontSize:8}}>{s}</th>)}</tr></thead>
            <tbody>
              {["A","B","C","D","F"].map(g=><tr key={g}><td style={{...RS.shTd,fontWeight:800,color:GRADE_C[g],background:"#f0f4ff",width:20}}>{g}</td>{subjGrades.map((sg,i)=><td key={i} style={{...RS.shTd,color:GRADE_C[g]}}>{sg[g]||0}</td>)}</tr>)}
              <tr style={{background:C.primary,color:"#fff",fontWeight:700}}><td style={RS.shTd}>TOT</td>{subjGrades.map((sg,i)=><td key={i} style={RS.shTd}>{Object.values(sg).reduce((a,b)=>a+b,0)}</td>)}</tr>
            </tbody>
          </table>
        </div>
        <div style={{fontSize:10,fontWeight:700,color:C.primary,textAlign:"right",marginBottom:4}}>TOTAL STUDENTS: <b>{computed.length}</b></div>

        <div style={{overflowX:"auto"}}>
          <table style={{borderCollapse:"collapse",width:"100%",fontSize:9}}>
            <thead><tr style={{background:C.primary,color:"#fff"}}>
              {["INDEX","NAME","SEX",...subjs,"TOTAL","AVRG","GRD","DIV","PTS","PSTN"].map(h=>(
                <th key={h} style={{...RS.shTh,minWidth:h==="NAME"?140:h.length>4?36:30,textAlign:h==="NAME"?"left":"center"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {computed.map((s,ri)=>{
                const isAbs=s.status==="absent",isInc=s.status==="incomplete";
                return(
                  <tr key={s.id} style={{background:ri%2===0?"#fff":"#eef2ff"}}>
                    <td style={RS.shTd}>{s.admissionNo}</td>
                    <td style={{...RS.shTd,textAlign:"left",fontWeight:600,paddingLeft:5}}>{s.fullName}</td>
                    <td style={RS.shTd}>{s.sex}</td>
                    {isAbs?<td colSpan={subjs.length} style={{...RS.shTd,color:"#aaa",fontStyle:"italic"}}>— ABSENT —</td>
                    :isInc?<td colSpan={subjs.length} style={{...RS.shTd,color:"#aaa",fontStyle:"italic"}}>— INCOMPLETE —</td>
                    :subjs.map((_,si)=>{const gr=s.grades?.[si];if(!gr||gr.score===null)return<td key={si} style={RS.shTd}>–</td>;return<td key={si} style={{...RS.shTd,color:GRADE_C[gr.grade],fontWeight:700,background:GRADE_B[gr.grade]}}>{gr.score}<span style={{fontSize:7}}> {gr.grade}</span></td>;})
                    }
                    <td style={{...RS.shTd,fontWeight:800}}>{s.total??(isAbs?"ABS":isInc?"INC":"–")}</td>
                    <td style={RS.shTd}>{s.avg??"–"}</td>
                    <td style={{...RS.shTd,fontWeight:800,color:GRADE_C[s.agrd]}}>{s.agrd??"–"}</td>
                    <td style={{...RS.shTd,fontWeight:800,color:DIV_C[s.div]}}>{s.div??"–"}</td>
                    <td style={RS.shTd}>{s.points??"–"}</td>
                    <td style={{...RS.shTd,fontWeight:800}}>{s.posn??"–"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{display:"flex",justifyContent:"space-around",marginTop:20,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
          {["CLASS TEACHER","ACADEMIC TEACHER","HEAD OF SCHOOL","DATE"].map(l=>(
            <div key={l} style={{textAlign:"center",flex:1}}>
              <div style={{borderBottom:`1.5px solid ${C.primary}`,width:"80%",margin:"18px auto 4px"}}/>
              <div style={{fontSize:9,fontWeight:700,color:C.textSub,textTransform:"uppercase",letterSpacing:0.5}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DivBarChart({ divCounts }) {
  const max=Math.max(...Object.values(divCounts),1);
  return(
    <div style={{minWidth:120,background:"#f7f9ff",border:"1px solid #d0dcf8",borderRadius:8,padding:"7px 10px"}}>
      <div style={{fontSize:8,fontWeight:900,color:C.primary,textAlign:"center",marginBottom:4,letterSpacing:0.5}}>GRAPH OF DIVISION</div>
      <div style={{display:"flex",alignItems:"flex-end",gap:8,height:72,justifyContent:"center"}}>
        {Object.entries(divCounts).map(([div,count])=>(
          <div key={div} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <span style={{fontSize:9,fontWeight:700,color:DIV_C[div]}}>{count}</span>
            <div style={{width:18,borderRadius:"3px 3px 0 0",background:DIV_C[div],height:Math.max(count/max*55,4)}}/>
            <span style={{fontSize:8,fontWeight:700,color:DIV_C[div]}}>{div}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ANNOUNCEMENTS ADMIN ───────────────────────────────────────────────────────
function AnnouncementsAdmin({ showToast }) {
  const [anns,setAnns]      = useState([]);
  const [loading,setLoading]= useState(true);
  const [title,setTitle]    = useState("");
  const [body,setBody]      = useState("");
  const [cat,setCat]        = useState("general");
  const [posting,setPosting]= useState(false);

  useEffect(()=>{ api.getAnnouncements().then(setAnns).finally(()=>setLoading(false)); },[]);

  const post=async()=>{
    if(!title.trim()||!body.trim()){showToast("Title and body required","error");return;}
    setPosting(true);
    try{ const a=await api.createAnn({title,body,category:cat}); setAnns(p=>[a,...p]); setTitle("");setBody("");showToast("Announcement posted!"); }
    catch(e){showToast(e.message,"error");}
    finally{setPosting(false);}
  };

  const del=async id=>{ await api.deleteAnn(id); setAnns(p=>p.filter(a=>a.id!==id)); showToast("Deleted"); };

  return(
    <div style={{padding:24,maxWidth:780}}>
      <h2 style={{fontSize:22,fontWeight:900,color:C.text,marginBottom:20}}>📢 Announcements</h2>
      <div style={{background:"#fff",borderRadius:16,padding:20,boxShadow:"0 2px 8px rgba(0,0,0,0.06)",marginBottom:20}}>
        <h3 style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:14}}>Post New Announcement</h3>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title"
          style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:10,padding:"10px 14px",fontSize:14,marginBottom:10,outline:"none",fontFamily:"'Plus Jakarta Sans',sans-serif",boxSizing:"border-box"}}/>
        <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Write announcement body…" rows={4}
          style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:10,padding:"10px 14px",fontSize:14,marginBottom:10,outline:"none",resize:"vertical",fontFamily:"'Plus Jakarta Sans',sans-serif",boxSizing:"border-box"}}/>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <select value={cat} onChange={e=>setCat(e.target.value)} style={{border:`1.5px solid ${C.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,outline:"none"}}>
            <option value="general">General</option>
            <option value="academic">Academic</option>
            <option value="finance">Finance</option>
            <option value="sports">Sports</option>
          </select>
          <button onClick={post} disabled={posting} style={{background:C.primary,color:"#fff",border:"none",borderRadius:10,padding:"10px 22px",fontWeight:800,cursor:"pointer",fontSize:14,opacity:posting?0.7:1}}>
            {posting?"Posting…":"📢 Post"}
          </button>
        </div>
      </div>
      {anns.map(a=>(
        <div key={a.id} style={{background:"#fff",borderRadius:14,padding:16,marginBottom:10,boxShadow:"0 1px 6px rgba(0,0,0,0.05)",display:"flex",gap:12}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}>
              <span style={{fontSize:10,fontWeight:800,color:C.primary,background:`${C.primary}15`,padding:"2px 8px",borderRadius:5,textTransform:"uppercase"}}>{a.category}</span>
              <span style={{fontSize:11,color:C.textMuted}}>{new Date(a.created_at).toLocaleDateString()}</span>
            </div>
            <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:5}}>{a.title}</div>
            <div style={{fontSize:13,color:C.textSub,lineHeight:1.55}}>{a.body}</div>
            <div style={{fontSize:11,color:C.textMuted,marginTop:6}}>— {a.author}</div>
          </div>
          <button onClick={()=>del(a.id)} style={{background:"none",border:"none",color:C.danger,cursor:"pointer",fontSize:18,padding:"4px",alignSelf:"flex-start"}}>🗑</button>
        </div>
      ))}
    </div>
  );
}

// ── ALL STUDENTS ──────────────────────────────────────────────────────────────
function AllStudentsView({ allComputed }) {
  const [search,setSearch]=useState("");
  const all=allComputed.flatMap(cl=>(cl.computed??[]).map(s=>({...s,className:cl.name})));
  const filtered=search?all.filter(s=>s.fullName?.toLowerCase().includes(search.toLowerCase())||s.admissionNo?.toLowerCase().includes(search.toLowerCase())):all;

  return(
    <div style={{padding:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h2 style={{fontSize:22,fontWeight:900,color:C.text}}>👥 All Students ({all.length})</h2>
        <div style={{display:"flex",alignItems:"center",background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:10,padding:"6px 14px",gap:8}}>
          <span>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or admission…"
            style={{border:"none",outline:"none",fontSize:13,width:220,fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        <table style={{borderCollapse:"collapse",width:"100%",fontSize:13}}>
          <thead><tr style={{background:C.primary,color:"#fff"}}>
            {["#","Adm No","Full Name","Class","Sex","Total","Avg","Grade","Division","Status"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontWeight:800,fontSize:11}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((s,i)=>(
              <tr key={s.id} style={{background:i%2===0?"#fff":C.bg,borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:"8px 12px",color:C.textMuted,fontSize:11}}>{i+1}</td>
                <td style={{padding:"8px 12px",fontFamily:"'DM Mono',monospace",fontSize:12}}>{s.admissionNo}</td>
                <td style={{padding:"8px 12px",fontWeight:700}}>{s.fullName}</td>
                <td style={{padding:"8px 12px",fontSize:12,color:C.textSub}}>{s.className}</td>
                <td style={{padding:"8px 12px"}}>{s.sex}</td>
                <td style={{padding:"8px 12px",fontWeight:700}}>{s.total??"–"}</td>
                <td style={{padding:"8px 12px"}}>{s.avg??"–"}</td>
                <td style={{padding:"8px 12px",fontWeight:800,color:GRADE_C[s.agrd]}}>{s.agrd??"–"}</td>
                <td style={{padding:"8px 12px",fontWeight:800,color:DIV_C[s.div]}}>{s.div??"–"}</td>
                <td style={{padding:"8px 12px"}}><span style={{background:s.status==="present"?`${C.success}18`:C.bg,color:s.status==="present"?C.success:C.textMuted,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700}}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const A = {
  root:   {display:"flex",height:"100vh",overflow:"hidden",fontFamily:"'Plus Jakarta Sans',sans-serif"},
  toast:  {position:"fixed",top:16,right:16,zIndex:9999,color:"#fff",padding:"10px 20px",borderRadius:8,fontSize:13,fontWeight:700,boxShadow:"0 4px 16px rgba(0,0,0,0.3)"},
  sidebar:{background:"#00695C",flexShrink:0},
  sideInner:{width:240,height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"},
  sideLogo:{padding:"16px 14px 10px",display:"flex",gap:10,alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.1)"},
  sideTitle:{color:"#fff",fontWeight:900,fontSize:13,lineHeight:1.2},
  sideSub:  {color:"rgba(255,255,255,0.55)",fontSize:9,fontWeight:600,letterSpacing:1},
  sideProfile:{margin:"10px 10px 4px",background:"rgba(255,255,255,0.1)",borderRadius:10,padding:"10px",display:"flex",gap:10,alignItems:"center"},
  sideUser: {color:"#fff",fontWeight:700,fontSize:12,lineHeight:1.3},
  sideRole: {color:"rgba(255,255,255,0.55)",fontSize:10,fontWeight:700,letterSpacing:0.5},
  nav:      {padding:"4px 8px",display:"flex",flexDirection:"column",gap:2},
  navItem:  {display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,background:"transparent",border:"none",color:"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:13,fontWeight:600,textAlign:"left",width:"100%"},
  navOn:    {background:"rgba(255,255,255,0.18)",color:"#fff"},
  sideSection:{padding:"10px 14px 4px",fontSize:9,fontWeight:800,color:"rgba(255,255,255,0.3)",letterSpacing:2,textTransform:"uppercase"},
  classList:{flex:1,overflowY:"auto",padding:"4px 8px"},
  clItem:   {display:"flex",alignItems:"center",borderRadius:8,marginBottom:3,padding:"5px 7px"},
  clOn:     {background:"rgba(255,255,255,0.2)"},
  clName:   {flex:1,color:"rgba(255,255,255,0.8)",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6},
  clCount:  {background:"rgba(255,255,255,0.15)",borderRadius:8,padding:"1px 6px",fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.7)"},
  clDel:    {background:"none",border:"none",cursor:"pointer",fontSize:13,color:"rgba(255,255,255,0.4)",padding:"2px"},
  addClBtn: {margin:"4px 10px",background:"rgba(255,255,255,0.1)",border:"1.5px dashed rgba(255,255,255,0.3)",color:"rgba(255,255,255,0.7)",borderRadius:8,padding:"7px",fontSize:11,cursor:"pointer",fontWeight:700},
  logoutBtn:{margin:"8px 10px 14px",background:"rgba(255,255,255,0.08)",border:"none",color:"rgba(255,255,255,0.6)",borderRadius:8,padding:"9px",cursor:"pointer",fontSize:12,fontWeight:600},
  main:     {flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:C.bg},
  topBar:   {background:"#fff",height:52,display:"flex",alignItems:"center",padding:"0 20px",gap:12,borderBottom:`1px solid ${C.border}`,flexShrink:0},
  menuBtn:  {background:"none",border:"none",fontSize:20,cursor:"pointer",color:C.textSub},
  topBrand: {flex:1,fontWeight:800,fontSize:14,color:C.text},
  content:  {flex:1,overflow:"hidden",display:"flex",flexDirection:"column"},
};
const D={
  title:{fontSize:22,fontWeight:900,color:C.text,marginBottom:16},
  kpiRow:{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16},
  kpi:{flex:1,minWidth:110,background:"#fff",borderRadius:10,padding:"12px 14px",boxShadow:"0 1px 6px rgba(0,0,0,0.06)",display:"flex",flexDirection:"column",gap:3},
  grid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12},
  card:{background:"#fff",borderRadius:14,padding:16,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"},
  cardTitle:{fontSize:13,fontWeight:800,color:C.text,marginBottom:12,borderBottom:`1px solid ${C.border}`,paddingBottom:8},
  tbl:{borderCollapse:"collapse",width:"100%",fontSize:12},
  th:{background:C.primary,color:"#fff",padding:"6px 10px",textAlign:"center",fontWeight:700,fontSize:11,border:"1px solid rgba(255,255,255,0.2)"},
  td:{padding:"6px 10px",textAlign:"center",border:`1px solid ${C.border}`},
  openBtn:{background:C.primary,color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontWeight:700,fontSize:11},
};
const CW={
  wrap:{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"},
  tabBar:{display:"flex",alignItems:"center",background:"#fff",borderBottom:`2px solid ${C.border}`,padding:"0 16px",gap:8,flexShrink:0},
  tab:{background:"none",border:"none",padding:"11px 16px",fontSize:12,cursor:"pointer",color:C.textSub,fontWeight:700,borderBottom:"3px solid transparent"},
  tabOn:{color:C.primary,borderBottom:`3px solid ${C.primary}`},
  toolBtn:{background:C.bg,border:`1.5px solid ${C.border}`,color:C.text,borderRadius:6,padding:"5px 10px",fontSize:11,cursor:"pointer",fontWeight:700},
};
const EP={
  wrap:{padding:14,display:"flex",flexDirection:"column",gap:12},
  strip:{display:"flex",gap:8,flexWrap:"wrap"},
  statCard:{flex:1,minWidth:90,background:"#fff",borderRadius:8,padding:"10px 12px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",textAlign:"center"},
  card:{background:"#fff",borderRadius:12,padding:14,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"},
  cardT:{fontSize:13,fontWeight:800,color:C.text,marginBottom:10,borderBottom:`1.5px solid ${C.border}`,paddingBottom:6,margin:"0 0 10px"},
  row:{display:"flex",flexWrap:"wrap",gap:10,marginBottom:8},
  fld:{display:"flex",flexDirection:"column",gap:3},
  lbl:{fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:0.5},
  inp:{border:`1.5px solid ${C.border}`,borderRadius:6,padding:"5px 9px",fontSize:12,outline:"none",fontFamily:"'Plus Jakarta Sans',sans-serif"},
  subjChip:{display:"flex",alignItems:"center",background:"#eef2ff",border:`1.5px solid #c0d0ff`,borderRadius:6,padding:"3px 7px",gap:4},
  subjName:{fontSize:11,fontWeight:700,color:C.primary,cursor:"pointer"},
  subjInp:{width:80,fontSize:11,border:`1px solid ${C.primaryLight}`,borderRadius:3,padding:"2px 4px",outline:"none"},
  subjX:{background:"none",border:"none",color:C.danger,cursor:"pointer",fontSize:14,padding:0,lineHeight:1,fontWeight:800},
  searchBox:{display:"flex",alignItems:"center",background:C.bg,border:`1.5px solid ${C.border}`,borderRadius:8,padding:"4px 10px",gap:6},
  searchInp:{border:"none",background:"transparent",outline:"none",fontSize:12,width:200,color:C.text,fontFamily:"'Plus Jakarta Sans',sans-serif"},
  addBtn:{background:C.primary,color:"#fff",border:"none",borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer",fontWeight:800},
  tbl:{borderCollapse:"collapse",width:"100%",fontSize:11},
  th:{background:C.primary,color:"#fff",padding:"6px 4px",textAlign:"center",fontWeight:700,fontSize:10,whiteSpace:"nowrap",border:"1px solid rgba(255,255,255,0.2)"},
  td:{padding:"3px 3px",textAlign:"center",borderBottom:`1px solid ${C.border}`,verticalAlign:"middle"},
  cIn:{border:`1px solid ${C.border}`,borderRadius:3,padding:"3px 4px",fontSize:11,textAlign:"center",outline:"none",fontFamily:"'Plus Jakarta Sans',sans-serif"},
  cSel:{border:`1px solid ${C.border}`,borderRadius:3,padding:"3px",fontSize:10,outline:"none"},
  delBtn:{background:C.danger,color:"#fff",border:"none",borderRadius:4,width:20,height:20,cursor:"pointer",fontSize:10,lineHeight:1},
};
const RS={
  shTh:{background:C.primary,color:"#fff",padding:"4px 3px",textAlign:"center",fontWeight:700,border:"1px solid rgba(255,255,255,0.2)",fontSize:9,whiteSpace:"nowrap"},
  shTd:{padding:"2px 3px",textAlign:"center",border:`1px solid ${C.border}`,fontSize:9},
};
