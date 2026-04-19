import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Alert
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { COLORS, SHADOW, gradeColor, divColor } from "../utils/theme";

// ── RESULTS SCREEN ────────────────────────────────────────────────────────────
export function ResultsScreen({ navigation }) {
  const { user } = useAuth();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try { setData(await api.results()); }
    catch { Alert.alert("Error", "Could not load results"); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return <LoadingView />;

  return (
    <ScrollView style={S.root} contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={COLORS.primary} />}>

      <View style={S.resultsHeader}>
        <Text style={S.resultsTitle}>Results</Text>
        <Text style={S.resultsSub}>Student: {user?.fullName}</Text>
        <Text style={S.resultsSub}>{user?.form} - Stream: {user?.stream}</Text>
      </View>

      {/* Table */}
      <View style={S.tableCard}>
        <View style={S.tableHead}>
          <Text style={[S.tableHCell, { flex: 2 }]}>Subject</Text>
          <Text style={S.tableHCell}>Score</Text>
          <Text style={S.tableHCell}>Grd</Text>
          <Text style={[S.tableHCell, { flex: 1.5 }]}>Remarks</Text>
        </View>
        {(data?.results ?? []).map((r, i) => (
          <View key={i} style={[S.tableRow, { backgroundColor: i % 2 === 0 ? "#fff" : COLORS.bg }]}>
            <Text style={[S.tableCell, { flex: 2, fontWeight: "600" }]}>{r.subject}</Text>
            <Text style={[S.tableCell, { fontWeight: "800", color: gradeColor(r.grade) }]}>{r.score ?? "–"}</Text>
            <Text style={[S.tableCell, { fontWeight: "900", color: gradeColor(r.grade) }]}>{r.grade ?? "–"}</Text>
            <Text style={[S.tableCell, { flex: 1.5, color: COLORS.textLight, fontSize: 12 }]}>{r.remarks ?? "–"}</Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      {data && (
        <View style={S.summaryCard}>
          <Row label="Total Points" value={data.points} />
          <Row label="Average Score" value={data.average} />
          <Row label="Division" value={`Division ${data.division}`} valueStyle={{ color: divColor(data.division), fontWeight: "900" }} />
          <View style={[S.statusBar, { backgroundColor: data.status === "PASS" ? COLORS.success : COLORS.danger }]}>
            <Text style={S.statusBarText}>Status: {data.status}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ── SUBJECTS SCREEN ───────────────────────────────────────────────────────────
export function SubjectsScreen() {
  const [subjects, setSubjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try { setSubjects(await api.subjects()); }
    catch { Alert.alert("Error", "Could not load subjects"); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetch(); }, []);
  if (loading) return <LoadingView />;

  return (
    <ScrollView style={S.root} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={COLORS.primary} />}>
      <Text style={S.pageTitle}>My Subjects</Text>
      {subjects.map((s, i) => (
        <View key={i} style={S.subjCard}>
          <View style={S.subjIconWrap}>
            <Text style={{ fontSize: 26 }}>{s.icon ?? "📚"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={S.subjName}>{s.subject}</Text>
            <Text style={S.subjTeacher}>{s.teacher}</Text>
            <View style={S.progBarBg}>
              <View style={[S.progBarFill, {
                width: `${Math.min(s.progress, 100)}%`,
                backgroundColor: gradeColor(s.grade) || COLORS.primary
              }]} />
            </View>
            <Text style={[S.progLabel, { color: gradeColor(s.grade) || COLORS.primary }]}>{s.progress}% Progress</Text>
          </View>
          <TouchableOpacity style={S.dotsBtn}>
            <Text style={{ color: COLORS.textMuted, fontSize: 18 }}>⋯</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

// ── TIMETABLE SCREEN ──────────────────────────────────────────────────────────
export function TimetableScreen() {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
  const [timetable, setTimetable] = useState({});
  const [activeDay, setActiveDay] = useState(days[new Date().getDay() - 1] ?? "Monday");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.timetable().then(setTimetable).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingView />;

  const periods = timetable[activeDay] ?? [];

  return (
    <ScrollView style={S.root} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={S.pageTitle}>📅 Timetable</Text>

      {/* Day tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {days.map(day => (
          <TouchableOpacity key={day} onPress={() => setActiveDay(day)}
            style={[S.dayTab, activeDay === day && S.dayTabActive]}>
            <Text style={[S.dayTabText, activeDay === day && S.dayTabTextActive]}>{day.slice(0,3)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {periods.length === 0 ? (
        <View style={S.emptyWrap}><Text style={S.emptyText}>No classes on {activeDay}</Text></View>
      ) : periods.map((p, i) => (
        <View key={i} style={S.periodCard}>
          <View style={[S.periodTime, { backgroundColor: COLORS.primary }]}>
            <Text style={S.periodTimeText}>{p.time_start}</Text>
            <Text style={S.periodTimeSep}>–</Text>
            <Text style={S.periodTimeText}>{p.time_end}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={S.periodSubj}>{p.subject}</Text>
            <Text style={S.periodTeacher}>👨‍🏫 {p.teacher || "TBA"}</Text>
            <Text style={S.periodRoom}>🚪 Room {p.room || "–"}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ── ANNOUNCEMENTS SCREEN ──────────────────────────────────────────────────────
export function AnnouncementsScreen() {
  const [anns, setAnns]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.announcements().then(setAnns).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingView />;

  const catColor = cat => ({ academic: COLORS.primary, finance: COLORS.warning, general: COLORS.textLight }[cat] ?? COLORS.textLight);

  return (
    <ScrollView style={S.root} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={S.pageTitle}>📢 Announcements</Text>
      {anns.length === 0 && <View style={S.emptyWrap}><Text style={S.emptyText}>No announcements yet</Text></View>}
      {anns.map(a => (
        <View key={a.id} style={S.annCard}>
          <View style={[S.annStripe, { backgroundColor: catColor(a.category) }]} />
          <View style={{ flex: 1, padding: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={[S.annCat, { color: catColor(a.category) }]}>{(a.category ?? "general").toUpperCase()}</Text>
              <Text style={S.annDate}>{new Date(a.created_at).toLocaleDateString()}</Text>
            </View>
            <Text style={S.annTitle}>{a.title}</Text>
            <Text style={S.annBody}>{a.body}</Text>
            <Text style={S.annAuthor}>— {a.author}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ── PROFILE SCREEN ────────────────────────────────────────────────────────────
export function ProfileScreen() {
  const { user, logout, setUser } = useAuth();
  const [editing, setEditing]     = useState(false);
  const [guardianName, setGuardian] = useState(user?.guardianName ?? "");
  const [contactNumber, setContact] = useState(user?.contactNumber ?? "");
  const [saving, setSaving]         = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ guardianName, contactNumber });
      setUser(u => ({ ...u, guardianName, contactNumber }));
      setEditing(false);
      Alert.alert("Saved", "Profile updated successfully");
    } catch (e) { Alert.alert("Error", e.message); }
    finally { setSaving(false); }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout }
    ]);
  };

  return (
    <ScrollView style={S.root} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Avatar */}
      <View style={S.profileHero}>
        <View style={S.avatar}>
          <Text style={{ fontSize: 44 }}>{user?.sex === "F" ? "👩‍🎓" : "👨‍🎓"}</Text>
        </View>
        <Text style={S.profileName}>{user?.fullName}</Text>
        <Text style={S.profileSub}>Admission No: {user?.admissionNo}</Text>
        <Text style={S.profileSub}>{user?.form} - Stream {user?.stream}</Text>
        <Text style={S.profileSub}>{user?.className}</Text>
      </View>

      {/* Actions */}
      <View style={S.actionRow}>
        <TouchableOpacity style={S.editBtn} onPress={() => setEditing(e => !e)}>
          <Text style={S.editBtnText}>{editing ? "Cancel Edit" : "Edit Profile"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={S.logoutBtn} onPress={handleLogout}>
          <Text style={S.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={S.infoCard}>
        <InfoRow icon="🎂" label="Date of Birth" value={user?.dateOfBirth || "Not set"} />
        <InfoRow icon="👨‍👩‍👦" label="Guardian Name"
          value={editing ? undefined : (user?.guardianName || "Not set")}
          editValue={guardianName} onEdit={setGuardian} editing={editing} />
        <InfoRow icon="📱" label="Contact Number"
          value={editing ? undefined : (user?.contactNumber || "Not set")}
          editValue={contactNumber} onEdit={setContact} editing={editing} keyboard="phone-pad" />
      </View>

      {editing && (
        <TouchableOpacity style={S.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={S.saveBtnText}>{saving ? "Saving…" : "Save Changes"}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────
function LoadingView() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

function Row({ label, value, valueStyle }) {
  return (
    <View style={S.summaryRow}>
      <Text style={S.summaryLabel}>{label}</Text>
      <Text style={[S.summaryValue, valueStyle]}>{value ?? "–"}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value, editValue, onEdit, editing, keyboard }) {
  return (
    <View style={S.infoRow}>
      <Text style={S.infoIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={S.infoLabel}>{label}</Text>
        {editing && onEdit ? (
          <TextInput value={editValue} onChangeText={onEdit}
            style={S.infoEdit} keyboardType={keyboard ?? "default"} />
        ) : (
          <Text style={S.infoValue}>{value}</Text>
        )}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root:      { flex: 1, backgroundColor: COLORS.bg },
  pageTitle: { fontSize: 22, fontWeight: "900", color: COLORS.text, marginBottom: 16 },
  emptyWrap: { alignItems: "center", padding: 40 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },

  // Results
  resultsHeader: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 16, marginBottom: 16 },
  resultsTitle:  { fontSize: 22, fontWeight: "900", color: "#fff" },
  resultsSub:    { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 },

  tableCard:  { backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 16, overflow: "hidden", ...SHADOW, marginBottom: 16 },
  tableHead:  { flexDirection: "row", backgroundColor: COLORS.primary, padding: 10 },
  tableHCell: { flex: 1, color: "#fff", fontWeight: "800", fontSize: 11, textAlign: "center" },
  tableRow:   { flexDirection: "row", padding: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tableCell:  { flex: 1, textAlign: "center", fontSize: 13, color: COLORS.text },

  summaryCard: { marginHorizontal: 16, backgroundColor: COLORS.white, borderRadius: 16, padding: 16, ...SHADOW },
  summaryRow:  { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  summaryLabel:{ fontSize: 13, color: COLORS.textLight },
  summaryValue:{ fontSize: 14, fontWeight: "700", color: COLORS.text },
  statusBar:   { borderRadius: 10, paddingVertical: 10, alignItems: "center", marginTop: 8 },
  statusBarText: { color: "#fff", fontWeight: "900", fontSize: 15, letterSpacing: 0.5 },

  // Subjects
  subjCard:     { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 10,
                  flexDirection: "row", gap: 12, alignItems: "center", ...SHADOW },
  subjIconWrap: { width: 52, height: 52, borderRadius: 14, backgroundColor: `${COLORS.primary}15`,
                  alignItems: "center", justifyContent: "center" },
  subjName:     { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 2 },
  subjTeacher:  { fontSize: 12, color: COLORS.textLight, marginBottom: 6 },
  progBarBg:    { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: "hidden" },
  progBarFill:  { height: "100%", borderRadius: 3 },
  progLabel:    { fontSize: 11, fontWeight: "700", marginTop: 3 },
  dotsBtn:      { padding: 8 },

  // Timetable
  dayTab:       { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8,
                  backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border },
  dayTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayTabText:   { fontSize: 13, fontWeight: "700", color: COLORS.textLight },
  dayTabTextActive: { color: "#fff" },

  periodCard:   { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 10,
                  flexDirection: "row", gap: 12, alignItems: "center", ...SHADOW },
  periodTime:   { borderRadius: 10, padding: 10, alignItems: "center", minWidth: 65 },
  periodTimeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  periodTimeSep:  { color: "rgba(255,255,255,0.6)", fontSize: 10 },
  periodSubj:   { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  periodTeacher:{ fontSize: 12, color: COLORS.textLight, marginBottom: 2 },
  periodRoom:   { fontSize: 12, color: COLORS.textLight },

  // Announcements
  annCard:   { backgroundColor: COLORS.white, borderRadius: 14, marginBottom: 10,
               flexDirection: "row", overflow: "hidden", ...SHADOW },
  annStripe: { width: 5 },
  annCat:    { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  annDate:   { fontSize: 10, color: COLORS.textMuted },
  annTitle:  { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 5 },
  annBody:   { fontSize: 13, color: COLORS.textLight, lineHeight: 19 },
  annAuthor: { fontSize: 11, color: COLORS.textMuted, marginTop: 8, fontStyle: "italic" },

  // Profile
  profileHero: { backgroundColor: COLORS.primary, alignItems: "center", padding: 30, paddingTop: 20,
                 borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  avatar:      { width: 88, height: 88, borderRadius: 44, backgroundColor: "rgba(255,255,255,0.2)",
                 alignItems: "center", justifyContent: "center", marginBottom: 12, borderWidth: 3, borderColor: "#fff" },
  profileName: { fontSize: 22, fontWeight: "900", color: "#fff", marginBottom: 4 },
  profileSub:  { fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 2 },

  actionRow:   { flexDirection: "row", gap: 12, margin: 16 },
  editBtn:     { flex: 1, backgroundColor: COLORS.primary, borderRadius: 12, height: 46,
                 alignItems: "center", justifyContent: "center" },
  editBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  logoutBtn:   { flex: 1, backgroundColor: COLORS.danger, borderRadius: 12, height: 46,
                 alignItems: "center", justifyContent: "center" },
  logoutBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },

  infoCard:  { backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 16, overflow: "hidden", ...SHADOW },
  infoRow:   { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  infoIcon:  { fontSize: 20, width: 28 },
  infoLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  infoEdit:  { fontSize: 14, borderBottomWidth: 1.5, borderBottomColor: COLORS.primary, paddingVertical: 4, color: COLORS.text },

  saveBtn:     { backgroundColor: COLORS.success, margin: 16, borderRadius: 12, height: 48,
                 alignItems: "center", justifyContent: "center" },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
