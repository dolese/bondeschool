const express = require("express");
const router  = express.Router();
const db      = require("../db");
const { authMiddleware } = require("../middleware/auth");

// Grading helpers
const getGrade = s => { const n=Number(s); if(s===""||s===null||isNaN(n))return null; if(n>=75)return"A";if(n>=65)return"B";if(n>=45)return"C";if(n>=30)return"D";return"F"; };
const gp = g => ({A:1,B:2,C:3,D:4,F:5}[g]??5);
const getDiv = p => { if(p<=17)return"I";if(p<=21)return"II";if(p<=25)return"III";if(p<=33)return"IV";return"0"; };
const getRemarks = g => ({A:"Excellent",B:"Very Good",C:"Fair",D:"Below Average",F:"Fail"}[g]??"");

// ── GET /api/student/results ──────────────────────────────────────────────────
router.get("/results", authMiddleware, (req, res) => {
  if (req.user.role !== "student") return res.status(403).json({ error: "Students only" });

  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(req.user.id);
  const cls = db.prepare("SELECT * FROM classes WHERE id = ?").get(student.class_id);
  if (!student || !cls) return res.status(404).json({ error: "Not found" });

  const subjects = JSON.parse(cls.subjects ?? "[]");
  const scores   = JSON.parse(student.scores ?? "[]");

  const results = subjects.map((subj, i) => {
    const score = scores[i] ?? "";
    const grade = getGrade(score);
    return { subject: subj, score: score === "" ? null : Number(score), grade, remarks: getRemarks(grade) };
  }).filter(r => r.score !== null);

  const valid  = results.filter(r => r.grade);
  const total  = valid.reduce((a, r) => a + r.score, 0);
  const avg    = valid.length ? (total / valid.length).toFixed(1) : 0;
  const pts    = [...valid].sort((a,b)=>gp(a.grade)-gp(b.grade)).slice(0,7).reduce((a,r)=>a+gp(r.grade),0);
  const div    = valid.length ? getDiv(pts) : null;
  const status = div && div !== "0" ? "PASS" : "FAIL";

  res.json({ results, total, average: avg, division: div, points: pts, status, className: cls.name, form: cls.form, stream: cls.stream });
});

// ── GET /api/student/subjects ─────────────────────────────────────────────────
router.get("/subjects", authMiddleware, (req, res) => {
  if (req.user.role !== "student") return res.status(403).json({ error: "Students only" });

  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(req.user.id);
  const cls = db.prepare("SELECT * FROM classes WHERE id = ?").get(student.class_id);
  if (!cls) return res.status(404).json({ error: "Not found" });

  const subjects = JSON.parse(cls.subjects ?? "[]");
  const scores   = JSON.parse(student.scores ?? "[]");
  const teachers = db.prepare("SELECT * FROM teachers WHERE role='teacher'").all();

  const teacherMap = {};
  teachers.forEach(t => { teacherMap[t.subject] = t.full_name; });

  const list = subjects.map((subj, i) => {
    const score   = scores[i] ?? "";
    const grade   = getGrade(score);
    const progress = score !== "" ? Number(score) : 0;
    return {
      subject: subj,
      teacher: teacherMap[subj] ?? "TBA",
      score: score !== "" ? Number(score) : null,
      grade, progress,
      remarks: getRemarks(grade),
      icon: subjectIcon(subj)
    };
  });

  res.json(list);
});

// ── GET /api/student/timetable ────────────────────────────────────────────────
router.get("/timetable", authMiddleware, (req, res) => {
  if (req.user.role !== "student") return res.status(403).json({ error: "Students only" });

  const student = db.prepare("SELECT class_id FROM students WHERE id = ?").get(req.user.id);
  const rows = db.prepare("SELECT * FROM timetable WHERE class_id = ? ORDER BY day, period").all(student.class_id);

  // Group by day
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
  const grouped = {};
  days.forEach(d => { grouped[d] = []; });
  rows.forEach(r => { if(grouped[r.day]) grouped[r.day].push(r); });

  res.json(grouped);
});

// Subject icon helper
function subjectIcon(subject) {
  const map = {
    Mathematics:"🔢", Math:"🔢", Biology:"🔬", Chemistry:"⚗️",
    Physics:"⚡", English:"📖", Kiswahili:"🗣️", History:"📜",
    Geography:"🌍", Civics:"⚖️", Commerce:"💼", Accounts:"🧾"
  };
  for (const [k,v] of Object.entries(map)) {
    if (subject.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return "📚";
}

module.exports = router;
