import type { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { adminEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { AuthScreenShell, FormTextInput, PrimaryButton } from "../components";
import { useAuth } from "../contexts/AuthContext";
import type { RootStackParamList } from "../navigation/types";
import { toastError, toastSuccess } from "../utils/toasts";

type Nav = StackNavigationProp<RootStackParamList, "AdminLogin">;

export default function AdminLoginScreen({ navigation }: { navigation: Nav }) {
  const { setAdminData } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const res = await fetchResponse(adminEndpoints.loginAdmin(), 1, {
        email,
        password,
      });
      if (!res?.success || !res.data) {
        toastError(res?.message ?? "Login failed");
        return;
      }
      setAdminData(res.data as Record<string, unknown>);
      toastSuccess(res.message ?? "Signed in");
      navigation.reset({ index: 0, routes: [{ name: "AdminTabs" }] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenShell
      badgeTone="admin"
      eyebrow="Administrator"
      title="Sign in"
      subtitle="Manage instructors, courses, and institutional data. Same credentials as the web admin panel."
      footer={
        <View style={styles.footer}>
          <Text style={styles.footerMuted}>Need an administrator account?</Text>
          <Pressable
            onPress={() => navigation.navigate("AdminSignup")}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Create an administrator account"
          >
            <Text style={styles.footerLink}>Create account</Text>
          </Pressable>
          <Text style={styles.footerHint}>
            Registration creates an administrator profile. Only proceed if your institution allows self-registration.
          </Text>
        </View>
      }
    >
      <FormTextInput
        label="Work email"
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
  footer: { marginTop: 28, alignItems: "center", paddingHorizontal: 8 },
  footerMuted: { fontSize: 14, color: "#64748b", marginBottom: 6 },
  footerLink: { fontSize: 16, fontWeight: "700", color: "#c2410c" },
  footerHint: {
    marginTop: 14,
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 18,
  },
});
