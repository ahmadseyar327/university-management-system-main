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
import AmbientBackground from "../components/AmbientBackground";
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
      <View style={[styles.centered, styles.loaderWrap]}>
        <ActivityIndicator size="large" color="#1a365d" />
      </View>
    );
  }

  const hasSession = !!(studentData || instructorData || adminData);

  return (
    <View style={styles.root}>
      <AmbientBackground variant="home" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.brandMark}>UMS</Text>
          <Text style={styles.title}>University Management</Text>
          <Text style={styles.tagline}>
            Secure access for students, faculty, and administrators. Sign in with your existing account.
          </Text>
        </View>

        {hasSession && (
          <View style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>You’re signed in</Text>
            <Text style={styles.sessionHint}>Continue where you left off.</Text>
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
                <Text style={styles.primaryBtnText}>Continue as administrator</Text>
              </Pressable>
            )}
          </View>
        )}

        <Text style={styles.sectionEyebrow}>Get started</Text>
        <Text style={styles.sectionTitle}>Choose your role</Text>
        <Text style={styles.sectionSub}>
          You’ll open the sign-in screen first. Need an account? You can register from there where your role allows it.
        </Text>

        <Pressable
          style={styles.roleCard}
          onPress={() => navigation.navigate("StudentLogin")}
          android_ripple={{ color: "#e2e8f0" }}
        >
          <View style={[styles.roleAccent, { backgroundColor: "#4f46e5" }]} />
          <View style={styles.roleBody}>
            <Text style={styles.roleName}>Student</Text>
            <Text style={styles.roleDesc}>Courses, marks, attendance, and profile</Text>
          </View>
          <Text style={styles.roleChevron}>→</Text>
        </Pressable>

        <Pressable
          style={styles.roleCard}
          onPress={() => navigation.navigate("InstructorLogin")}
          android_ripple={{ color: "#e2e8f0" }}
        >
          <View style={[styles.roleAccent, { backgroundColor: "#059669" }]} />
          <View style={styles.roleBody}>
            <Text style={styles.roleName}>Instructor</Text>
            <Text style={styles.roleDesc}>Classes, attendance, and grading</Text>
          </View>
          <Text style={styles.roleChevron}>→</Text>
        </Pressable>

        <Pressable
          style={styles.roleCard}
          onPress={() => navigation.navigate("AdminLogin")}
          android_ripple={{ color: "#e2e8f0" }}
        >
          <View style={[styles.roleAccent, { backgroundColor: "#c2410c" }]} />
          <View style={styles.roleBody}>
            <Text style={styles.roleName}>Administrator</Text>
            <Text style={styles.roleDesc}>Instructors, courses, and system records</Text>
          </View>
          <Text style={styles.roleChevron}>→</Text>
        </Pressable>

        {hasSession && (
          <View style={styles.signOutBlock}>
            <Text style={styles.signOutEyebrow}>Session</Text>
            {studentData && (
              <Pressable style={styles.signOutBtn} onPress={() => void signOutStudent()}>
                <Text style={styles.signOutText}>Sign out student</Text>
              </Pressable>
            )}
            {instructorData && (
              <Pressable style={styles.signOutBtn} onPress={() => void signOutInstructor()}>
                <Text style={styles.signOutText}>Sign out instructor</Text>
              </Pressable>
            )}
            {adminData && (
              <Pressable style={styles.signOutBtn} onPress={() => void signOutAdmin()}>
                <Text style={styles.signOutText}>Sign out administrator</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  scroll: { flex: 1, backgroundColor: "#f8fafc" },
  container: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 40,
  },
  loaderWrap: { flex: 1, backgroundColor: "#f8fafc" },
  centered: { justifyContent: "center", alignItems: "center" },
  hero: { marginBottom: 28 },
  brandMark: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1a365d",
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: "#64748b",
    lineHeight: 24,
    maxWidth: 400,
  },
  sessionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sessionTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  sessionHint: { fontSize: 14, color: "#64748b", marginBottom: 16 },
  primaryBtn: {
    backgroundColor: "#1a365d",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16, textAlign: "center" },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  sectionSub: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 18,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    paddingVertical: 4,
    paddingRight: 16,
  },
  roleAccent: { width: 5, alignSelf: "stretch", borderRadius: 2, marginVertical: 8, marginLeft: 8 },
  roleBody: { flex: 1, paddingVertical: 14, paddingHorizontal: 14 },
  roleName: { fontSize: 17, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  roleDesc: { fontSize: 14, color: "#64748b", lineHeight: 20 },
  roleChevron: { fontSize: 18, color: "#94a3b8", fontWeight: "600" },
  signOutBlock: { marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  signOutEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1,
    marginBottom: 12,
  },
  signOutBtn: { paddingVertical: 12 },
  signOutText: { color: "#b91c1c", fontWeight: "600", fontSize: 15, textAlign: "center" },
});
