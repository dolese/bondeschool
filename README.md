# 🎓 BONDE SmartSchool TZ — Full Platform

A complete school management platform with:

- 🌐 **Web App** (React) — Homepage + Student Portal + Admin Dashboard
- 📱 **Mobile App** (React Native / Expo) — iOS & Android
- 🗄️ **Backend API** (Node.js + Express + SQLite)

---

## 📁 Project Structure

```
smartschool/
├── backend/              ← API Server
│   ├── server.js         ← Express entry point (port 5000)
│   ├── db.js             ← SQLite database + seed data
│   ├── middleware/
│   │   └── auth.js       ← JWT authentication
│   └── routes/
│       ├── auth.js       ← Login / Profile
│       ├── classes.js    ← Classes + Students CRUD
│       ├── student.js    ← Student portal (results, subjects, timetable)
│       └── announcements.js
│
├── web/                  ← React Web App
│   ├── src/
│   │   ├── App.js        ← Root router
│   │   ├── api.js        ← API helper
│   │   ├── theme.js      ← Colors & grading logic
│   │   └── pages/
│   │       ├── Homepage.js      ← Public school website
│   │       ├── LoginPage.js     ← Login page
│   │       ├── StudentPortal.js ← Student dashboard
│   │       └── AdminPortal.js   ← Admin + Result System
│   └── public/index.html
│
└── mobile/               ← Expo React Native App (iOS + Android)
    ├── App.js            ← Navigation root
    ├── src/
    │   ├── api.js        ← API helper
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── utils/theme.js
    │   └── screens/
    │       ├── LoginScreen.js
    │       ├── HomeScreen.js
    │       └── Screens.js  ← Results, Subjects, Timetable, Profile, Announcements
    └── app.json
```

---

## 🚀 Quick Start

### 1️⃣ Start Backend

```bash
cd smartschool/backend
npm install
npm start
```

✅ Backend runs at `http://localhost:5000`

**Default Login Accounts:**

| Role    | Username    | Password    |
|---------|-------------|-------------|
| Student | john.mwambo | student123  |
| Student | amina.juma  | student123  |
| Admin   | admin       | admin123    |

---

### 2️⃣ Start Web App

```bash
cd smartschool/web
npm install
npm start
```

✅ Web app opens at `http://localhost:3000`

**3 Sections:**

- `/` → Public school homepage
- Student login → Student portal (results, subjects, timetable, profile)
- Admin login → Admin dashboard + Result System + Announcements

---

### 3️⃣ Start Mobile App (iOS & Android)

```bash
cd smartschool/mobile
npm install
npx expo start
```

**Then:**

- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan QR code with **Expo Go** app on your phone

⚠️ **If testing on a real phone:**
Edit `mobile/src/api.js` and change:

```js
export const API_BASE = "http://YOUR_COMPUTER_IP:5000/api";
// Example: "http://192.168.1.45:5000/api"
```

Find your IP: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

---

## 🌐 API Endpoints

### Auth

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/login` | Login (student or admin) |
| GET  | `/api/auth/me` | Get current user |
| PUT  | `/api/auth/profile` | Update profile |

### Student Portal

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/student/results` | My results + division |
| GET | `/api/student/subjects` | My subjects + progress |
| GET | `/api/student/timetable` | Weekly timetable |

### Admin — Classes

| Method | URL | Description |
|--------|-----|-------------|
| GET    | `/api/classes` | List all classes |
| POST   | `/api/classes` | Create class |
| GET    | `/api/classes/:id` | Get class + students |
| PUT    | `/api/classes/:id` | Update class |
| DELETE | `/api/classes/:id` | Delete class |
| POST   | `/api/classes/:id/students` | Add student |
| POST   | `/api/classes/:id/students/bulk` | Bulk import |
| PUT    | `/api/classes/:id/students/:sid` | Update student |
| DELETE | `/api/classes/:id/students/:sid` | Delete student |

### Announcements

| Method | URL | Description |
|--------|-----|-------------|
| GET    | `/api/announcements` | List announcements |
| POST   | `/api/announcements` | Create (admin) |
| DELETE | `/api/announcements/:id` | Delete (admin) |

---

## 📦 Deploy Online (Free)

### Option A — Render.com (Recommended)

1. Push project to GitHub
2. Create account at render.com
3. New → Web Service → Connect repo
4. Build: `cd backend && npm install`
5. Start: `cd backend && npm start`
6. For web: deploy `/web/build` to Netlify or Vercel

### Option B — Railway.app

1. Upload project to GitHub
2. Connect to railway.app
3. Set start command: `cd backend && npm start`
4. Railway auto-detects Node.js

---

## 📱 Build Mobile App for App Stores

### Android APK (for testing)

```bash
cd mobile
npx expo build:android
```

### iOS (requires Mac + Apple Developer account)

```bash
cd mobile
npx expo build:ios
```

### Using EAS Build (recommended)

```bash
npm install -g eas-cli
eas login
eas build --platform android
eas build --platform ios
```

---

## 🛡️ Grading System (Tanzania)

| Score | Grade | Points |
|-------|-------|--------|
| 75–100 | A | 1 |
| 65–74  | B | 2 |
| 45–64  | C | 3 |
| 30–44  | D | 4 |
| 0–29   | F | 5 |

**Division (Best 7 subjects):**

- Division I: 7–17 points
- Division II: 18–21 points
- Division III: 22–25 points
- Division IV: 26–33 points
- Division 0: 34–35 points

---

## 💾 Database (SQLite)

File: `backend/smartschool.db` (auto-created on first run)

**Tables:**

- `classes` — Class information + subjects
- `students` — Student accounts + scores
- `teachers` — Teacher/admin accounts
- `announcements` — School announcements
- `timetable` — Weekly timetable per class

**Backup:** Just copy `smartschool.db` file.

---

Built with ❤️ for BONDE Secondary School, Kigoma, Tanzania







## create-production-builds.yml

name: Create Production Builds

jobs:
  build_android:
    type: build # This job type creates a production build for Android
    params:
      platform: android
  build_ios:
    type: build # This job type creates a production build for iOS
    params:
      platform: ios
