import type { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { studentEndpoints } from "../api/endpoints";
import { PrimaryButton } from "../components";
import { fetchResponse } from "../api/service";
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
    setLoading(true);
    try {
      const body = useRoll
        ? { email: "", rollNumber, password }
        : { email, rollNumber: null, password };
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
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Student login</Text>
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleChip, useRoll && styles.toggleChipActive]}
          onPress={() => setUseRoll(true)}
        >
          <Text style={[styles.toggleText, useRoll && styles.toggleTextActive]}>
            Roll number
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleChip, !useRoll && styles.toggleChipActive]}
          onPress={() => setUseRoll(false)}
        >
          <Text style={[styles.toggleText, !useRoll && styles.toggleTextActive]}>
            Email
          </Text>
        </Pressable>
      </View>
      {useRoll ? (
        <TextInput
          style={styles.input}
          placeholder="Roll number"
          value={rollNumber}
          onChangeText={setRollNumber}
          autoCapitalize="none"
        />
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <PrimaryButton title="Sign in" loading={loading} onPress={() => void handleLogin()} />
      <Text style={styles.footer}>
        New student?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("StudentSignup")}>
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
  toggleRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  toggleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  toggleChipActive: { backgroundColor: "#1a365d", borderColor: "#1a365d" },
  toggleText: { color: "#4a5568", fontWeight: "600" },
  toggleTextActive: { color: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  footer: { marginTop: 24, fontSize: 15, color: "#4a5568", textAlign: "center" },
  link: { color: "#1a365d", fontWeight: "700" },
});
