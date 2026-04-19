const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const db      = require("../db");
const { authMiddleware } = require("../middleware/auth");

const parseClass = row => ({
  id: row.id, name: row.name, schoolInfo: JSON.parse(row.school_info),
  subjects: JSON.parse(row.subjects), stream: row.stream, form: row.form,
  createdAt: row.created_at, studentCount: row.student_count ?? 0,
});

const parseStudent = row => ({
  id: row.id, classId: row.class_id, admissionNo: row.admission_no,
  fullName: row.full_name, username: row.username, sex: row.sex,
  dateOfBirth: row.date_of_birth, guardianName: row.guardian_name,
  contactNumber: row.contact_number, profilePhoto: row.profile_photo,
  status: row.status, scores: JSON.parse(row.scores ?? "[]"),
  createdAt: row.created_at,
});

// ── Classes CRUD ──────────────────────────────────────────────────────────────
router.get("/", (req, res) => {
  const rows = db.prepare("SELECT c.*, COUNT(s.id) as student_count FROM classes c LEFT JOIN students s ON s.class_id=c.id GROUP BY c.id ORDER BY c.created_at ASC").all();
  res.json(rows.map(parseClass));
});

router.get("/:id", (req, res) => {
  const cls = db.prepare("SELECT * FROM classes WHERE id=?").get(req.params.id);
  if (!cls) return res.status(404).json({ error: "Class not found" });
  const students = db.prepare("SELECT * FROM students WHERE class_id=? ORDER BY admission_no").all(req.params.id);
  res.json({ ...parseClass(cls), students: students.map(parseStudent) });
});

router.post("/", authMiddleware, (req, res) => {
  const { name="New Class", schoolInfo={}, subjects=[], stream="A", form="Form IV" } = req.body;
  const r = db.prepare("INSERT INTO classes (name,school_info,subjects,stream,form) VALUES (?,?,?,?,?)")
    .run(name, JSON.stringify(schoolInfo), JSON.stringify(subjects), stream, form);
  res.status(201).json(parseClass(db.prepare("SELECT * FROM classes WHERE id=?").get(r.lastInsertRowid)));
});

router.put("/:id", authMiddleware, (req, res) => {
  const { name, schoolInfo, subjects, stream, form } = req.body;
  db.prepare("UPDATE classes SET name=COALESCE(?,name), school_info=COALESCE(?,school_info), subjects=COALESCE(?,subjects), stream=COALESCE(?,stream), form=COALESCE(?,form) WHERE id=?")
    .run(name??null, schoolInfo?JSON.stringify(schoolInfo):null, subjects?JSON.stringify(subjects):null, stream??null, form??null, req.params.id);
  res.json(parseClass(db.prepare("SELECT * FROM classes WHERE id=?").get(req.params.id)));
});

router.delete("/:id", authMiddleware, (req, res) => {
  db.prepare("DELETE FROM classes WHERE id=?").run(req.params.id);
  res.json({ success: true });
});

// ── Students CRUD ─────────────────────────────────────────────────────────────
router.get("/:id/students", (req, res) => {
  res.json(db.prepare("SELECT * FROM students WHERE class_id=? ORDER BY admission_no").all(req.params.id).map(parseStudent));
});

router.post("/:id/students", authMiddleware, (req, res) => {
  const cls = db.prepare("SELECT * FROM classes WHERE id=?").get(req.params.id);
  if (!cls) return res.status(404).json({ error: "Class not found" });
  const { admissionNo, fullName="", username, sex="M", dateOfBirth="", guardianName="", contactNumber="", password="student123", status="present", scores } = req.body;
  if (!admissionNo) return res.status(400).json({ error: "admissionNo required" });
  const uname = username || admissionNo.toLowerCase().replace(/\s+/g,".");
  const hash = bcrypt.hashSync(password, 10);
  const subj = JSON.parse(cls.subjects ?? "[]");
  const finalScores = scores ?? Array(subj.length).fill("");
  try {
    const r = db.prepare("INSERT INTO students (class_id,admission_no,full_name,username,password_hash,sex,date_of_birth,guardian_name,contact_number,status,scores) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
      .run(req.params.id, admissionNo, fullName, uname, hash, sex, dateOfBirth, guardianName, contactNumber, status, JSON.stringify(finalScores));
    res.status(201).json(parseStudent(db.prepare("SELECT * FROM students WHERE id=?").get(r.lastInsertRowid)));
  } catch(e) {
    res.status(400).json({ error: e.message.includes("UNIQUE") ? "Admission number or username already exists" : e.message });
  }
});

router.post("/:id/students/bulk", authMiddleware, (req, res) => {
  const cls = db.prepare("SELECT * FROM classes WHERE id=?").get(req.params.id);
  if (!cls) return res.status(404).json({ error: "Class not found" });
  const { students } = req.body;
  const insert = db.prepare("INSERT OR IGNORE INTO students (class_id,admission_no,full_name,username,password_hash,sex,date_of_birth,guardian_name,contact_number,status,scores) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
  const insertAll = db.transaction(() => {
    for (const s of students) {
      const hash = bcrypt.hashSync(s.password ?? "student123", 10);
      const uname = s.username || (s.admissionNo||"").toLowerCase().replace(/\s+/g,".");
      insert.run(req.params.id, s.admissionNo??"", s.fullName??"", uname, hash, s.sex??"M", s.dateOfBirth??"", s.guardianName??"", s.contactNumber??"", s.status??"present", JSON.stringify(s.scores??[]));
    }
  });
  insertAll();
  res.status(201).json(db.prepare("SELECT * FROM students WHERE class_id=?").all(req.params.id).map(parseStudent));
});

router.put("/:id/students/:sid", authMiddleware, (req, res) => {
  const { fullName, sex, status, scores, dateOfBirth, guardianName, contactNumber, admissionNo } = req.body;
  db.prepare("UPDATE students SET full_name=COALESCE(?,full_name), sex=COALESCE(?,sex), status=COALESCE(?,status), scores=COALESCE(?,scores), date_of_birth=COALESCE(?,date_of_birth), guardian_name=COALESCE(?,guardian_name), contact_number=COALESCE(?,contact_number), admission_no=COALESCE(?,admission_no) WHERE id=? AND class_id=?")
    .run(fullName??null, sex??null, status??null, scores?JSON.stringify(scores):null, dateOfBirth??null, guardianName??null, contactNumber??null, admissionNo??null, req.params.sid, req.params.id);
  res.json(parseStudent(db.prepare("SELECT * FROM students WHERE id=?").get(req.params.sid)));
});

router.delete("/:id/students/:sid", authMiddleware, (req, res) => {
  db.prepare("DELETE FROM students WHERE id=? AND class_id=?").run(req.params.sid, req.params.id);
  res.json({ success: true });
});

module.exports = router;
