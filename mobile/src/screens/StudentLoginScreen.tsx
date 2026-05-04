import type { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { studentEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { AuthScreenShell, PrimaryButton } from "../components";
import { useAuth } from "../contexts/AuthContext";
import type { RootStackParamList } from "../navigation/types";
import { toastError, toastSuccess } from "../utils/toasts";

type Nav = StackNavigationProp<RootStackParamList, "StudentLogin">;

export default function StudentLoginScreen({ navigation }: { navigation: Nav }) {
  const { setStudentData } = useAuth();
  const [useRoll, setUseRoll] = useState(true);
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const cleanEmail = email.trim();
    const cleanRoll = rollNumber.trim();
    if (useRoll && (!cleanRoll || Number.isNaN(Number(cleanRoll)))) {
      toastError("Enter a numeric roll number.");
      return;
    }
    if (!useRoll && !cleanEmail) {
      toastError("Email is required.");
      return;
    }
    if (!password) {
      toastError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const body = useRoll
        ? { email: "", rollNumber: String(Number(cleanRoll)), password }
        : { email: cleanEmail, rollNumber: null, password };
      const res = await fetchResponse(studentEndpoints.loginStudent(), 1, body);
      if (!res?.success || !res.data) {
        toastError(res?.message ?? "Login failed");
        return;
      }
      setStudentData(res.data as Record<string, unknown>);
      toastSuccess(res.message ?? "Signed in");
      navigation.reset({ index: 0, routes: [{ name: "StudentTabs" }] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenShell
      badgeTone="student"
      eyebrow="Student"
      title="Sign in"
      subtitle="Use the same email or roll number and password as the web portal."
      footer={
        <View style={styles.footer}>
          <Text style={styles.footerMuted}>Don’t have an account?</Text>
          <Pressable
            onPress={() => navigation.navigate("StudentSignup")}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Create a student account"
          >
            <Text style={styles.footerLink}>Create account</Text>
          </Pressable>
          <Text style={styles.footerHint}>You’ll register as a student — your account type is set automatically.</Text>
        </View>
      }
    >
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleChip, useRoll && styles.toggleChipActive]}
          onPress={() => setUseRoll(true)}
        >
          <Text style={[styles.toggleText, useRoll && styles.toggleTextActive]}>Roll number</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleChip, !useRoll && styles.toggleChipActive]}
          onPress={() => setUseRoll(false)}
        >
          <Text style={[styles.toggleText, !useRoll && styles.toggleTextActive]}>Email</Text>
        </Pressable>
      </View>
      {useRoll ? (
        <TextInput
          style={styles.input}
          placeholder="Roll number"
          value={rollNumber}
          onChangeText={setRollNumber}
          autoCapitalize="none"
          placeholderTextColor="#a0aec0"
        />
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#a0aec0"
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#a0aec0"
      />
      <PrimaryButton title="Sign in" loading={loading} onPress={() => void handleLogin()} />
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  toggleRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  toggleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  toggleChipActive: { backgroundColor: "#1a365d", borderColor: "#1a365d" },
  toggleText: { color: "#64748b", fontWeight: "600", fontSize: 14 },
  toggleTextActive: { color: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    color: "#1a202c",
    backgroundColor: "#fff",
  },
  footer: { marginTop: 28, alignItems: "center", paddingHorizontal: 8 },
  footerMuted: { fontSize: 14, color: "#64748b", marginBottom: 6 },
  footerLink: { fontSize: 16, fontWeight: "700", color: "#1a365d" },
  footerHint: {
    marginTop: 14,
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 18,
  },
});
