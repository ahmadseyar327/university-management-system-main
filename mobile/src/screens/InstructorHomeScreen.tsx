import type { DrawerScreenProps } from "@react-navigation/drawer";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import type { InstructorTabParamList, RootStackParamList } from "../navigation/types";
import { mongoId } from "../utils/mongoId";

type Props = DrawerScreenProps<InstructorTabParamList, "InstructorOverview">;

function fmt(v: unknown): string {
  if (v == null) return "—";
  return String(v);
}

export default function InstructorHomeScreen({ navigation }: Props) {
  const { instructorData, signOutInstructor } = useAuth();
  const stackNav = navigation.getParent<{
    navigate: (name: keyof RootStackParamList) => void;
    reset: (state: { index: number; routes: { name: keyof RootStackParamList }[] }) => void;
  }>();

  const rows = [
    { title: "Name", value: `${fmt(instructorData?.fname)} ${fmt(instructorData?.lname)}`.trim() },
    { title: "Email", value: fmt(instructorData?.email) },
    { title: "Joining date", value: fmt(instructorData?.createdAt) },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Profile</Text>
      <View style={styles.card}>
        {rows.map((r) => (
          <View key={r.title} style={styles.row}>
            <Text style={styles.rowTitle}>{r.title}</Text>
            <Text style={styles.rowValue}>{r.value || "—"}</Text>
          </View>
        ))}
      </View>
      <Pressable style={styles.outline} onPress={() => stackNav?.navigate("Home")}>
        <Text style={styles.outlineText}>Public home</Text>
      </Pressable>
      <Pressable
        style={styles.signOut}
        onPress={async () => {
          await signOutInstructor();
          stackNav?.reset({ index: 0, routes: [{ name: "Home" }] });
        }}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
      <Text style={styles.muted}>Id: {mongoId(instructorData)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40, backgroundColor: "#fff" },
  heading: { fontSize: 22, fontWeight: "700", color: "#1a202c", marginBottom: 16 },
  card: {
    backgroundColor: "#edf2f7",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  rowTitle: { fontSize: 12, fontWeight: "600", color: "#718096", marginBottom: 4 },
  rowValue: { fontSize: 16, color: "#1a202c" },
  outline: { paddingVertical: 12 },
  outlineText: { color: "#1a365d", fontWeight: "600", textAlign: "center" },
  signOut: { paddingVertical: 12, marginTop: 8 },
  signOutText: { color: "#c53030", fontWeight: "600", textAlign: "center" },
  muted: { marginTop: 16, fontSize: 11, color: "#a0aec0", textAlign: "center" },
});
