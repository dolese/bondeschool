import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { COLORS, FONTS, SHADOW, divColor } from "../utils/theme";

const MenuCard = ({ icon, title, subtitle, onPress, badge }) => (
  <TouchableOpacity style={S.menuCard} onPress={onPress} activeOpacity={0.85}>
    <View style={S.menuLeft}>
      <View style={S.menuIcon}><Text style={{ fontSize: 24 }}>{icon}</Text></View>
      <View>
        <Text style={S.menuTitle}>{title}</Text>
        <Text style={S.menuSub}>{subtitle}</Text>
      </View>
    </View>
    <View style={S.menuRight}>
      {badge ? <View style={S.badge}><Text style={S.badgeText}>{badge}</Text></View> : null}
      <Text style={S.menuArrow}>›</Text>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [results, setResults]             = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [refreshing, setRefreshing]       = useState(false);
  const [loading, setLoading]             = useState(true);

  const fetchData = async () => {
    try {
      const [res, anns] = await Promise.all([api.results(), api.announcements()]);
      setResults(res);
      setAnnouncements(anns.slice(0, 3));
    } catch (e) { /* offline graceful */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const newAnnCount = announcements.length;

  return (
    <ScrollView style={S.root} contentContainerStyle={S.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.white} />}>

      {/* Hero header */}
      <View style={S.hero}>
        <View style={S.heroBrand}>
          <Text style={S.heroLogo}>🎓</Text>
          <Text style={S.heroBrandText}>BONDE Secondary School</Text>
        </View>
        <Text style={S.heroGreet}>Hello, {user?.fullName?.split(" ")[0] ?? "Student"} 👋</Text>
        <Text style={S.heroSub}>{user?.form} - Stream: {user?.stream}</Text>
      </View>

      {/* Division badge */}
      {results && (
        <View style={S.divCard}>
          <Text style={S.divLabel}>Average Score</Text>
          <View style={S.divBadge}>
            <Text style={S.divScore}>{results.average}</Text>
            <View style={[S.divTag, { backgroundColor: divColor(results.division) }]}>
              <Text style={S.divTagText}>Division {results.division}</Text>
            </View>
          </View>
          <View style={[S.statusBadge, { backgroundColor: results.status === "PASS" ? COLORS.success : COLORS.danger }]}>
            <Text style={S.statusText}>Status: {results.status}</Text>
          </View>
        </View>
      )}
      {loading && !results && <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />}

      {/* Menu */}
      <View style={S.section}>
        <MenuCard icon="📚" title="Subjects" subtitle={`${user ? "8" : "–"} Courses`}
          onPress={() => navigation.navigate("Subjects")} />
        <MenuCard icon="📊" title="Results" subtitle="View Grades"
          onPress={() => navigation.navigate("Results")} />
        <MenuCard icon="📅" title="Timetable" subtitle="Weekly Schedule"
          onPress={() => navigation.navigate("Timetable")} />
        <MenuCard icon="📢" title="Announcements" subtitle={`${newAnnCount} Updates`}
          badge={newAnnCount > 0 ? String(newAnnCount) : null}
          onPress={() => navigation.navigate("Announcements")} />
      </View>

      {/* Latest announcements preview */}
      {announcements.length > 0 && (
        <View style={S.section}>
          <Text style={S.sectionTitle}>📢 Latest Updates</Text>
          {announcements.map(a => (
            <View key={a.id} style={S.annCard}>
              <View style={[S.annDot, { backgroundColor: a.category === "academic" ? COLORS.primary : COLORS.accent }]} />
              <View style={{ flex: 1 }}>
                <Text style={S.annTitle}>{a.title}</Text>
                <Text style={S.annBody} numberOfLines={2}>{a.body}</Text>
                <Text style={S.annDate}>{new Date(a.created_at).toLocaleDateString()}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const S = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 32 },

  hero:       { backgroundColor: COLORS.primary, padding: 24, paddingTop: 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroBrand:  { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  heroLogo:   { fontSize: 22 },
  heroBrandText: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "700" },
  heroGreet:  { color: "#fff", fontSize: 26, fontWeight: "900", marginBottom: 4 },
  heroSub:    { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "600" },

  divCard:    { backgroundColor: COLORS.white, margin: 16, borderRadius: 16, padding: 18, ...SHADOW },
  divLabel:   { fontSize: 11, fontWeight: "700", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  divBadge:   { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  divScore:   { fontSize: 32, fontWeight: "900", color: COLORS.text },
  divTag:     { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  divTagText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  statusBadge:{ borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  statusText: { color: "#fff", fontWeight: "800", fontSize: 14, letterSpacing: 0.5 },

  section:     { marginHorizontal: 16, marginTop: 8 },
  sectionTitle:{ fontSize: 14, fontWeight: "800", color: COLORS.text, marginBottom: 10, marginTop: 8 },

  menuCard:   { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 10,
                flexDirection: "row", alignItems: "center", justifyContent: "space-between", ...SHADOW },
  menuLeft:   { flexDirection: "row", alignItems: "center", gap: 14 },
  menuIcon:   { width: 48, height: 48, borderRadius: 12, backgroundColor: `${COLORS.primary}15`,
                alignItems: "center", justifyContent: "center" },
  menuTitle:  { fontSize: 16, fontWeight: "700", color: COLORS.text },
  menuSub:    { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  menuRight:  { flexDirection: "row", alignItems: "center", gap: 8 },
  menuArrow:  { fontSize: 22, color: COLORS.textMuted, fontWeight: "300" },
  badge:      { backgroundColor: COLORS.danger, borderRadius: 10, minWidth: 20, height: 20,
                alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  badgeText:  { color: "#fff", fontSize: 11, fontWeight: "800" },

  annCard:    { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 8,
                flexDirection: "row", gap: 12, ...SHADOW },
  annDot:     { width: 4, borderRadius: 2, alignSelf: "stretch" },
  annTitle:   { fontSize: 13, fontWeight: "700", color: COLORS.text, marginBottom: 3 },
  annBody:    { fontSize: 12, color: COLORS.textLight, lineHeight: 17 },
  annDate:    { fontSize: 10, color: COLORS.textMuted, marginTop: 4 },
});
