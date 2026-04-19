const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");

const db = new Database(path.join(__dirname, "smartschool.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS classes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL DEFAULT 'New Class',
    school_info TEXT NOT NULL DEFAULT '{}',
    subjects    TEXT NOT NULL DEFAULT '[]',
    stream      TEXT DEFAULT 'A',
    form        TEXT DEFAULT 'Form IV',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS students (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id        INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    admission_no    TEXT UNIQUE NOT NULL,
    full_name       TEXT NOT NULL DEFAULT '',
    username        TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    sex             TEXT NOT NULL DEFAULT 'M',
    date_of_birth   TEXT DEFAULT '',
    guardian_name   TEXT DEFAULT '',
    contact_number  TEXT DEFAULT '',
    profile_photo   TEXT DEFAULT '',
    status          TEXT NOT NULL DEFAULT 'present',
    scores          TEXT NOT NULL DEFAULT '[]',
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS teachers (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name     TEXT NOT NULL,
    username      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email         TEXT DEFAULT '',
    subject       TEXT DEFAULT '',
    role          TEXT DEFAULT 'teacher',
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    body        TEXT NOT NULL,
    category    TEXT DEFAULT 'general',
    author      TEXT DEFAULT 'Administration',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS timetable (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id    INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    day         TEXT NOT NULL,
    period      INTEGER NOT NULL,
    time_start  TEXT NOT NULL,
    time_end    TEXT NOT NULL,
    subject     TEXT NOT NULL,
    teacher     TEXT DEFAULT '',
    room        TEXT DEFAULT '',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
  CREATE INDEX IF NOT EXISTS idx_timetable_class ON timetable(class_id);
`);

// ── Seed data ─────────────────────────────────────────────────────────────────
const classCount = db.prepare("SELECT COUNT(*) as c FROM classes").get();
if (classCount.c === 0) {
  const defaultInfo = JSON.stringify({
    name: "BONDE Secondary School",
    authority: "PRIME MINISTER'S OFFICE",
    region: "KIGOMA", district: "Muheza DC",
    form: "FORM FOUR", term: "ANNUAL EXAMINATION", year: "2026"
  });
  const subjects = JSON.stringify(["Mathematics","English","Biology","History","Kiswahili","Geography","Civics","Physics","Chemistry"]);

  const cls = db.prepare("INSERT INTO classes (name, school_info, subjects, stream, form) VALUES (?,?,?,?,?)")
    .run("Form IV - Stream B", defaultInfo, subjects, "B", "Form IV");

  // Seed students
  const pw = bcrypt.hashSync("student123", 10);
  db.prepare(`INSERT INTO students (class_id,admission_no,full_name,username,password_hash,sex,date_of_birth,guardian_name,contact_number,status,scores)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(cls.lastInsertRowid,"20456","John Mwambo","john.mwambo",pw,"M","2005-03-12","Mr. Mwambo","0712 345 678","present",
      JSON.stringify([75,62,58,80,66,55,72,60,65]));

  db.prepare(`INSERT INTO students (class_id,admission_no,full_name,username,password_hash,sex,date_of_birth,guardian_name,contact_number,status,scores)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(cls.lastInsertRowid,"20457","Amina Juma","amina.juma",pw,"F","2005-07-20","Mrs. Juma","0755 678 901","present",
      JSON.stringify([88,74,69,82,79,68,85,72,70]));

  // Seed teacher/admin
  const adminPw = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO teachers (full_name,username,password_hash,email,subject,role) VALUES (?,?,?,?,?,?)")
    .run("Admin User","admin",adminPw,"admin@bonde.ac.tz","","admin");
  db.prepare("INSERT INTO teachers (full_name,username,password_hash,email,subject,role) VALUES (?,?,?,?,?,?)")
    .run("Mr. Kasksa","mr.kasksa",adminPw,"kasksa@bonde.ac.tz","Mathematics","teacher");

  // Seed announcements
  const insAnn = db.prepare("INSERT INTO announcements (title,body,category,author) VALUES (?,?,?,?)");
  insAnn.run("End of Term Exams","End of term examinations will begin on 15th June 2026. All students must be present.","academic","Administration");
  insAnn.run("School Fees Reminder","All students are reminded to clear school fees by end of month.","finance","Bursar");

  // Seed timetable
  const insTT = db.prepare("INSERT INTO timetable (class_id,day,period,time_start,time_end,subject,teacher,room) VALUES (?,?,?,?,?,?,?,?)");
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
  const periods = [
    {p:1,s:"07:00",e:"07:40"},{p:2,s:"07:40",e:"08:20"},{p:3,s:"08:20",e:"09:00"},
    {p:4,s:"09:20",e:"10:00"},{p:5,s:"10:00",e:"10:40"},{p:6,s:"11:00",e:"11:40"},
    {p:7,s:"11:40",e:"12:20"},{p:8,s:"13:00",e:"13:40"}
  ];
  const daySubjects = {
    Monday:    ["Mathematics","Mathematics","English","","Biology","History","Kiswahili",""],
    Tuesday:   ["English","Biology","Mathematics","","Geography","Civics","Physics",""],
    Wednesday: ["History","Kiswahili","Geography","","Mathematics","English","Chemistry",""],
    Thursday:  ["Biology","Physics","Chemistry","","Kiswahili","Mathematics","Geography",""],
    Friday:    ["Civics","Geography","History","","English","Biology","Mathematics",""],
  };
  const teacherMap = {Mathematics:"Mr. Kasksa",English:"Ms. Mumba",Biology:"Mr. Joma",
    History:"Mrs. Hassan",Kiswahili:"Mr. Ali",Geography:"Mrs. Temba",
    Civics:"Mr. Ngowi",Physics:"Ms. Patel",Chemistry:"Mr. Said"};

  days.forEach(day => {
    periods.forEach((per,i) => {
      const subj = daySubjects[day][i];
      if(subj) insTT.run(cls.lastInsertRowid,day,per.p,per.s,per.e,subj,teacherMap[subj]??"","101");
    });
  });

  console.log("✅ Database seeded successfully");
  console.log("   Student login: john.mwambo / student123");
  console.log("   Admin login:   admin / admin123");
}

module.exports = db;
