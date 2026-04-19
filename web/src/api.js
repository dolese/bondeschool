const BASE = "/api";

async function req(method, url, body) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(BASE + url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Server error");
  return data;
}

export const api = {
  // Auth
  login:            (creds)        => req("POST", "/auth/login", creds),
  me:               ()             => req("GET",  "/auth/me"),
  updateProfile:    (data)         => req("PUT",  "/auth/profile", data),
  // Student portal
  myResults:        ()             => req("GET",  "/student/results"),
  mySubjects:       ()             => req("GET",  "/student/subjects"),
  myTimetable:      ()             => req("GET",  "/student/timetable"),
  // Admin — classes
  getClasses:       ()             => req("GET",  "/classes"),
  getClass:         (id)           => req("GET",  `/classes/${id}`),
  createClass:      (d)            => req("POST", "/classes", d),
  updateClass:      (id, d)        => req("PUT",  `/classes/${id}`, d),
  deleteClass:      (id)           => req("DELETE",`/classes/${id}`),
  // Admin — students
  addStudent:       (cid, d)       => req("POST", `/classes/${cid}/students`, d),
  bulkImport:       (cid, students)=> req("POST", `/classes/${cid}/students/bulk`, { students }),
  updateStudent:    (cid, sid, d)  => req("PUT",  `/classes/${cid}/students/${sid}`, d),
  deleteStudent:    (cid, sid)     => req("DELETE",`/classes/${cid}/students/${sid}`),
  // Announcements
  getAnnouncements: ()             => req("GET",  "/announcements"),
  createAnn:        (d)            => req("POST", "/announcements", d),
  deleteAnn:        (id)           => req("DELETE",`/announcements/${id}`),
};
