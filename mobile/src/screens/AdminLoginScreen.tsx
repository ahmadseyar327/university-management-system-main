import type { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { adminEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { FormTextInput, PrimaryButton } from "../components";
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
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Admin login</Text>
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
      <Text style={styles.footer}>
        New admin?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("AdminSignup")}>
          Create an account
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#fff" },
  container: { flexGrow: 1, padding: 24, paddingTop: 48, paddingBottom: 32, backgroundColor: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: 20,
  },
  footer: { marginTop: 24, fontSize: 15, color: "#4a5568", textAlign: "center" },
  link: { color: "#1a365d", fontWeight: "700" },
});
