import type { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import type { RootStackParamList } from "../navigation/types";

type Nav = StackNavigationProp<RootStackParamList, "AdminHome">;

function displayName(u: Record<string, unknown> | null): string {
  if (!u) return "Admin";
  const fn = u.fname != null ? String(u.fname) : "";
  const ln = u.lname != null ? String(u.lname) : "";
  const name = `${fn} ${ln}`.trim();
  return name || "Admin";
}

export default function AdminHomeScreen({ navigation }: { navigation: Nav }) {
  const { adminData, signOutAdmin } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {displayName(adminData)}</Text>
      <Text style={styles.body}>
        Wire instructor and course admin flows using `adminEndpoints` and `courseEndpoints`.
      </Text>
      <Pressable style={styles.btn} onPress={() => navigation.navigate("Home")}>
        <Text style={styles.btnText}>Home</Text>
      </Pressable>
      <Pressable
        style={styles.outline}
        onPress={async () => {
          await signOutAdmin();
          navigation.reset({ index: 0, routes: [{ name: "Home" }] });
        }}
      >
        <Text style={styles.outlineText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 48, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", color: "#1a202c", marginBottom: 12 },
  body: { fontSize: 15, color: "#4a5568", lineHeight: 22, marginBottom: 24 },
  btn: {
    backgroundColor: "#1a365d",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  btnText: { color: "#fff", fontWeight: "700", textAlign: "center" },
  outline: { paddingVertical: 12 },
  outlineText: { color: "#c53030", fontWeight: "600", textAlign: "center" },
});
