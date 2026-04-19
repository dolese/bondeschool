import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Change this to your computer's IP when testing on a real device ───────────
export const API_BASE = "http://localhost:5000/api";
// On real device: "http://192.168.1.XXX:5000/api"

const getToken = () => AsyncStorage.getItem("token");

export async function apiRequest(method, path, body, requiresAuth = true) {
  const headers = { "Content-Type": "application/json" };
  if (requiresAuth) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Server error");
  return data;
}

export const api = {
  login:        (creds)   => apiRequest("POST", "/auth/login", creds, false),
  me:           ()        => apiRequest("GET",  "/auth/me"),
  updateProfile:(data)    => apiRequest("PUT",  "/auth/profile", data),
  results:      ()        => apiRequest("GET",  "/student/results"),
  subjects:     ()        => apiRequest("GET",  "/student/subjects"),
  timetable:    ()        => apiRequest("GET",  "/student/timetable"),
  announcements:()        => apiRequest("GET",  "/announcements", null, false),
};
