const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const db      = require("../db");
const { SECRET, authMiddleware } = require("../middleware/auth");

// ── POST /api/auth/login ───────────────────────────────────────────────────────
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });

  // Try student first
  const student = db.prepare("SELECT * FROM students WHERE username = ? OR admission_no = ?").get(username, username);
  if (student && bcrypt.compareSync(password, student.password_hash)) {
    const cls = db.prepare("SELECT * FROM classes WHERE id = ?").get(student.class_id);
    const token = jwt.sign({ id: student.id, role: "student", name: student.full_name }, SECRET, { expiresIn: "7d" });
    return res.json({
      token, role: "student",
      user: {
        id: student.id, fullName: student.full_name,
        admissionNo: student.admission_no, username: student.username,
        sex: student.sex, dateOfBirth: student.date_of_birth,
        guardianName: student.guardian_name, contactNumber: student.contact_number,
        profilePhoto: student.profile_photo, classId: student.class_id,
        className: cls?.name ?? "", form: cls?.form ?? "",
        stream: cls?.stream ?? "", status: student.status,
      }
    });
  }

  // Try teacher/admin
  const teacher = db.prepare("SELECT * FROM teachers WHERE username = ?").get(username);
  if (teacher && bcrypt.compareSync(password, teacher.password_hash)) {
    const token = jwt.sign({ id: teacher.id, role: teacher.role, name: teacher.full_name }, SECRET, { expiresIn: "7d" });
    return res.json({
      token, role: teacher.role,
      user: { id: teacher.id, fullName: teacher.full_name, username: teacher.username, role: teacher.role, email: teacher.email, subject: teacher.subject }
    });
  }

  res.status(401).json({ error: "Invalid username or password" });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get("/me", authMiddleware, (req, res) => {
  if (req.user.role === "student") {
    const student = db.prepare("SELECT * FROM students WHERE id = ?").get(req.user.id);
    if (!student) return res.status(404).json({ error: "Not found" });
    const cls = db.prepare("SELECT * FROM classes WHERE id = ?").get(student.class_id);
    return res.json({
      id: student.id, fullName: student.full_name, admissionNo: student.admission_no,
      sex: student.sex, dateOfBirth: student.date_of_birth,
      guardianName: student.guardian_name, contactNumber: student.contact_number,
      profilePhoto: student.profile_photo, classId: student.class_id,
      className: cls?.name ?? "", form: cls?.form ?? "", stream: cls?.stream ?? "",
      role: "student"
    });
  }
  const teacher = db.prepare("SELECT * FROM teachers WHERE id = ?").get(req.user.id);
  res.json({ ...teacher, role: teacher?.role });
});

// ── PUT /api/auth/profile ─────────────────────────────────────────────────────
router.put("/profile", authMiddleware, (req, res) => {
  if (req.user.role !== "student") return res.status(403).json({ error: "Students only" });
  const { guardianName, contactNumber, dateOfBirth } = req.body;
  db.prepare("UPDATE students SET guardian_name=COALESCE(?,guardian_name), contact_number=COALESCE(?,contact_number), date_of_birth=COALESCE(?,date_of_birth) WHERE id=?")
    .run(guardianName??null, contactNumber??null, dateOfBirth??null, req.user.id);
  res.json({ success: true });
});

module.exports = router;
