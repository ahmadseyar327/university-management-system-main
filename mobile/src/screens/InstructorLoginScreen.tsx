import type { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { instructorEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { AuthScreenShell, FormTextInput, PrimaryButton } from "../components";
import { useAuth } from "../contexts/AuthContext";
import type { RootStackParamList } from "../navigation/types";
import { colors, radius, roleThemes, spacing } from "../theme";
import { toastError, toastSuccess } from "../utils/toasts";

type Nav = StackNavigationProp<RootStackParamList, "InstructorLogin">;

export default function InstructorLoginScreen({ navigation }: { navigation: Nav }) {
  const { setInstructorData } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const res = await fetchResponse(instructorEndpoints.loginInstructor(), 1, {
        email,
        password,
      });
      if (!res?.success || !res.data) {
        toastError(res?.message ?? "Login failed");
        return;
      }
      setInstructorData(res.data as Record<string, unknown>);
      toastSuccess(res.message ?? "Signed in");
      navigation.reset({ index: 0, routes: [{ name: "InstructorTabs" }] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenShell
      badgeTone="instructor"
      eyebrow="Instructor"
      title="Sign in"
      subtitle="Faculty access for classes, attendance, and grades. Use the email and password issued by your administrator."
      footer={
        <View style={styles.footer}>
          <Text style={styles.footerMuted}>New instructor?</Text>
          <Text style={styles.footerBody}>
            Instructor accounts are created by an administrator — there is no self-service sign up. Contact your department
            or IT if you need access.
          </Text>
        </View>
      }
    >
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Institution-managed access</Text>
        <Text style={styles.noticeText}>
          Your role is assigned when an admin registers you. This screen is for sign in only.
        </Text>
      </View>
      <FormTextInput
        label="Email"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <FormTextInput
        label="Password"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <PrimaryButton title="Sign in" loading={loading} onPress={() => void handleLogin()} />
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: roleThemes.instructor.accentSoft,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.instructor,
  },
  noticeTitle: { fontSize: 14, fontWeight: "700", color: roleThemes.instructor.drawerBg, marginBottom: 6 },
  noticeText: { fontSize: 13, color: colors.instructor, lineHeight: 19 },
  footer: { marginTop: 28, alignItems: "center", paddingHorizontal: spacing.sm },
  footerMuted: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, marginBottom: spacing.sm },
  footerBody: { fontSize: 13, color: colors.textMuted, textAlign: "center", lineHeight: 19 },
});
