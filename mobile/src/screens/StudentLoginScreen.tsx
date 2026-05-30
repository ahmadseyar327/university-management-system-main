import type { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { studentEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { AuthScreenShell, FormTextInput, PrimaryButton } from "../components";
import { useAuth } from "../contexts/AuthContext";
import type { RootStackParamList } from "../navigation/types";
import { colors, radius, spacing } from "../theme";
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
      subtitle="Use the same credentials as the web portal."
      footer={
        <View style={styles.footer}>
          <Text style={styles.footerMuted}>Don't have an account?</Text>
          <Pressable onPress={() => navigation.navigate("StudentSignup")} hitSlop={12}>
            <Text style={styles.footerLink}>Create account</Text>
          </Pressable>
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
        <FormTextInput
          label="Roll number"
          placeholder="Enter roll number"
          value={rollNumber}
          onChangeText={setRollNumber}
          autoCapitalize="none"
          keyboardType="number-pad"
        />
      ) : (
        <FormTextInput
          label="Email"
          placeholder="you@university.edu"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      )}
      <FormTextInput
        label="Password"
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <PrimaryButton title="Sign in" loading={loading} onPress={() => void handleLogin()} />
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  toggleRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  toggleChip: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
  },
  toggleChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { color: colors.textSecondary, fontWeight: "600", fontSize: 14 },
  toggleTextActive: { color: "#fff" },
  footer: { marginTop: spacing.lg, alignItems: "center" },
  footerMuted: { fontSize: 14, color: colors.textSecondary, marginBottom: 6 },
  footerLink: { fontSize: 16, fontWeight: "700", color: colors.primary },
});
