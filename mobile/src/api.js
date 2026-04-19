import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// ── API URL is configured in app.json → expo.extra.apiUrl ────────────────────
// For real device testing, update that value to your machine's local IP:
//   "extra": { "apiUrl": "http://192.168.1.XXX:5000/api" }
export const API_BASE = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:5000/api";

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
