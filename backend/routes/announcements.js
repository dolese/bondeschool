const express = require("express");
const router  = express.Router();
const db      = require("../db");
const { authMiddleware } = require("../middleware/auth");

// ── GET /api/announcements ────────────────────────────────────────────────────
router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM announcements ORDER BY created_at DESC LIMIT 20").all();
  res.json(rows);
});

// ── POST /api/announcements ───────────────────────────────────────────────────
router.post("/", authMiddleware, (req, res) => {
  const { title, body, category="general" } = req.body;
  if (!title || !body) return res.status(400).json({ error: "Title and body required" });
  const r = db.prepare("INSERT INTO announcements (title,body,category,author) VALUES (?,?,?,?)")
    .run(title, body, category, req.user.name ?? "Admin");
  res.status(201).json(db.prepare("SELECT * FROM announcements WHERE id=?").get(r.lastInsertRowid));
});

// ── DELETE /api/announcements/:id ─────────────────────────────────────────────
router.delete("/:id", authMiddleware, (req, res) => {
  db.prepare("DELETE FROM announcements WHERE id=?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
