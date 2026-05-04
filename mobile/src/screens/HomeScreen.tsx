import type { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import type { RootStackParamList } from "../navigation/types";

type Nav = StackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: { navigation: Nav }) {
  const {
    studentData,
    instructorData,
    adminData,
    hydrated,
    signOutStudent,
    signOutInstructor,
    signOutAdmin,
  } = useAuth();

  if (!hydrated) {
    return (
      <View style={[styles.centered, styles.container]}>
        <ActivityIndicator size="large" color="#1a365d" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>University MIS</Text>
      <Text style={styles.subtitle}>Sign in with your existing web account.</Text>

      {(studentData || instructorData || adminData) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Signed in</Text>
          {studentData && (
            <Pressable
              style={styles.primaryBtn}
              onPress={() => navigation.navigate("StudentTabs")}
            >
              <Text style={styles.primaryBtnText}>Continue as student</Text>
            </Pressable>
          )}
          {instructorData && (
            <Pressable
              style={styles.primaryBtn}
              onPress={() => navigation.navigate("InstructorTabs")}
            >
              <Text style={styles.primaryBtnText}>Continue as instructor</Text>
            </Pressable>
          )}
          {adminData && (
            <Pressable
              style={styles.primaryBtn}
              onPress={() => navigation.navigate("AdminTabs")}
            >
              <Text style={styles.primaryBtnText}>Continue as admin</Text>
            </Pressable>
          )}
        </View>
      )}

      <Text style={styles.sectionLabel}>Sign in</Text>
      <Pressable
        style={styles.secondaryBtn}
        onPress={() => navigation.navigate("StudentLogin")}
      >
        <Text style={styles.secondaryBtnText}>Student</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryBtn}
        onPress={() => navigation.navigate("InstructorLogin")}
      >
        <Text style={styles.secondaryBtnText}>Instructor</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryBtn}
        onPress={() => navigation.navigate("AdminLogin")}
      >
        <Text style={styles.secondaryBtnText}>Admin</Text>
      </Pressable>

      <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Create account</Text>
      <Text style={styles.signupHint}>
        Instructor accounts are created by an admin on the web app (same as your MIS).
      </Text>
      <Pressable
        style={styles.linkBtn}
        onPress={() => navigation.navigate("StudentSignup")}
      >
        <Text style={styles.linkBtnText}>Student sign up</Text>
      </Pressable>
      <Pressable
        style={styles.linkBtn}
        onPress={() => navigation.navigate("AdminSignup")}
      >
        <Text style={styles.linkBtnText}>Admin sign up</Text>
      </Pressable>

      {(studentData || instructorData || adminData) && (
        <>
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Sign out</Text>
          {studentData && (
            <Pressable style={styles.ghostBtn} onPress={() => void signOutStudent()}>
              <Text style={styles.ghostBtnText}>Sign out student</Text>
            </Pressable>
          )}
          {instructorData && (
            <Pressable
              style={styles.ghostBtn}
              onPress={() => void signOutInstructor()}
            >
              <Text style={styles.ghostBtnText}>Sign out instructor</Text>
            </Pressable>
          )}
          {adminData && (
            <Pressable style={styles.ghostBtn} onPress={() => void signOutAdmin()}>
              <Text style={styles.ghostBtnText}>Sign out admin</Text>
            </Pressable>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: 8,
  },
  subtitle: { fontSize: 15, color: "#4a5568", marginBottom: 28 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#edf2f7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: "#1a365d",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "600", textAlign: "center" },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#cbd5e0",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  secondaryBtnText: {
    color: "#2d3748",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
  ghostBtn: { paddingVertical: 10, marginBottom: 4 },
  ghostBtnText: { color: "#c53030", fontWeight: "500", textAlign: "center" },
  signupHint: {
    fontSize: 13,
    color: "#718096",
    marginBottom: 12,
    lineHeight: 18,
  },
  linkBtn: { paddingVertical: 12, marginBottom: 4 },
  linkBtnText: { color: "#1a365d", fontWeight: "600", fontSize: 16 },
});
