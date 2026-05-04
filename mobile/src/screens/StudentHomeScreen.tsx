import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import type { RootStackParamList, StudentTabParamList } from "../navigation/types";

type Props = BottomTabScreenProps<StudentTabParamList, "StudentOverview">;

function displayName(u: Record<string, unknown> | null): string {
  if (!u) return "Student";
  const fn = u.fname != null ? String(u.fname) : "";
  const ln = u.lname != null ? String(u.lname) : "";
  const name = `${fn} ${ln}`.trim();
  return name || "Student";
}

export default function StudentHomeScreen({ navigation }: Props) {
  const { studentData, signOutStudent } = useAuth();

  const stackNav = navigation.getParent<{
    navigate: (name: keyof RootStackParamList) => void;
    reset: (state: { index: number; routes: { name: keyof RootStackParamList }[] }) => void;
  }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {displayName(studentData)}</Text>
      <Text style={styles.body}>
        Student area uses bottom tabs (Overview / More). Next: courses, marks, and attendance
        using `studentEndpoints` and `courseEndpoints` like the web app.
      </Text>
      <Pressable style={styles.btn} onPress={() => stackNav?.navigate("Home")}>
        <Text style={styles.btnText}>Home</Text>
      </Pressable>
      <Pressable
        style={styles.outline}
        onPress={async () => {
          await signOutStudent();
          stackNav?.reset({ index: 0, routes: [{ name: "Home" }] });
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
