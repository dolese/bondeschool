import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, Image, Alert, ScrollView
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { COLORS, FONTS, SHADOW } from "../utils/theme";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter username and password");
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password.trim());
    } catch (e) {
      Alert.alert("Login Failed", e.message ?? "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={S.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={S.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={S.header}>
          <View style={S.logoCircle}>
            <Text style={S.logoEmoji}>🎓</Text>
          </View>
          <Text style={S.schoolName}>BONDE Secondary School</Text>
          <Text style={S.appName}>SmartSchool TZ</Text>
        </View>

        {/* Form */}
        <View style={S.card}>
          <Text style={S.cardTitle}>Student / Staff Login</Text>

          <View style={S.inputWrap}>
            <Text style={S.inputIcon}>👤</Text>
            <TextInput
              style={S.input}
              placeholder="Username / Admission Number"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={S.inputWrap}>
            <Text style={S.inputIcon}>🔒</Text>
            <TextInput
              style={[S.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showPw}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPw(p => !p)} style={{ padding: 8 }}>
              <Text style={{ fontSize: 16 }}>{showPw ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={S.loginBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={S.loginBtnText}>Login</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 14, alignSelf: "center" }}>
            <Text style={S.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Demo hint */}
        <View style={S.demo}>
          <Text style={S.demoTitle}>Demo Credentials</Text>
          <Text style={S.demoText}>Student: john.mwambo / student123</Text>
          <Text style={S.demoText}>Admin:   admin / admin123</Text>
        </View>

        <Text style={S.footer}>Powered by BONDE Secondary School</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const S = StyleSheet.create({
  root:      { flex: 1, backgroundColor: COLORS.bg },
  scroll:    { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  header:    { alignItems: "center", marginBottom: 28 },
  logoCircle:{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary,
               alignItems: "center", justifyContent: "center", marginBottom: 12, ...SHADOW },
  logoEmoji: { fontSize: 36 },
  schoolName:{ fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  appName:   { fontSize: 28, fontWeight: "900", color: COLORS.primary, letterSpacing: 0.5 },

  card:      { backgroundColor: COLORS.white, borderRadius: 20, padding: 24, width: "100%",
               maxWidth: 400, ...SHADOW },
  cardTitle: { fontSize: 17, fontWeight: "800", color: COLORS.text, marginBottom: 20, textAlign: "center" },

  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.bg,
               borderRadius: 12, marginBottom: 14, paddingHorizontal: 14, borderWidth: 1.5,
               borderColor: COLORS.border },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input:     { height: 50, flex: 1, fontSize: 14, color: COLORS.text },

  loginBtn:  { backgroundColor: COLORS.primary, borderRadius: 12, height: 52, alignItems: "center",
               justifyContent: "center", marginTop: 6 },
  loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
  forgotText:   { color: COLORS.primary, fontSize: 13, fontWeight: "600" },

  demo:      { marginTop: 20, backgroundColor: COLORS.white, borderRadius: 12, padding: 14,
               width: "100%", maxWidth: 400, borderLeftWidth: 3, borderLeftColor: COLORS.accent },
  demoTitle: { fontSize: 11, fontWeight: "800", color: COLORS.accent, marginBottom: 4, textTransform: "uppercase" },
  demoText:  { fontSize: 12, color: COLORS.textLight, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },

  footer:    { marginTop: 28, fontSize: 11, color: COLORS.textMuted },
});
