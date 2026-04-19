const express = require("express");
const cors    = require("cors");
const path    = require("path");

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",          require("./routes/auth"));
app.use("/api/student",       require("./routes/student"));
app.use("/api/classes",       require("./routes/classes"));
app.use("/api/announcements", require("./routes/announcements"));

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", app: "BONDE SmartSchool TZ", time: new Date().toISOString() })
);

// Serve React web build in production
const webBuild = path.join(__dirname, "../web/build");
app.use(express.static(webBuild));
app.get("*", (req, res) => {
  const index = path.join(webBuild, "index.html");
  res.sendFile(index, err => {
    if (err) res.status(200).send("BONDE SmartSchool Backend running. Start the web app separately.");
  });
});

app.listen(PORT, () => {
  console.log(`\n🎓 BONDE SmartSchool TZ Backend v2.0`);
  console.log(`✅  http://localhost:${PORT}`);
  console.log(`📦  API: http://localhost:${PORT}/api`);
  console.log(`\n   Default logins:`);
  console.log(`   Student: john.mwambo / student123`);
  console.log(`   Admin:   admin / admin123\n`);
});
