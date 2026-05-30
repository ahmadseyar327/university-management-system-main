import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AmbientBackground from "../components/AmbientBackground";
import FadeInView from "../components/FadeInView";
import { useAuth } from "../contexts/AuthContext";
import type { RootStackParamList } from "../navigation/types";
import { colors, radius, shadow, spacing, typography } from "../theme";

type Nav = StackNavigationProp<RootStackParamList, "Home">;

const roles = [
  {
    key: "student",
    title: "Student",
    desc: "Courses, marks, attendance & profile",
    icon: "school-outline" as const,
    color: colors.primary,
    route: "StudentLogin" as const,
  },
  {
    key: "instructor",
    title: "Instructor",
    desc: "Classes, grading & attendance",
    icon: "easel-outline" as const,
    color: colors.instructor,
    route: "InstructorLogin" as const,
  },
  {
    key: "admin",
    title: "Administrator",
    desc: "Instructors, courses & system records",
    icon: "shield-checkmark-outline" as const,
    color: colors.admin,
    route: "AdminLogin" as const,
  },
];

export default function HomeScreen({ navigation }: { navigation: Nav }) {
  const insets = useSafeAreaInsets();
  const { studentData, instructorData, adminData, hydrated, signOutStudent, signOutInstructor, signOutAdmin } =
    useAuth();

  if (!hydrated) {
    return (
      <View style={[styles.loaderWrap, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const hasSession = !!(studentData || instructorData || adminData);

  return (
    <View style={styles.root}>
      <AmbientBackground variant="home" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Ionicons name="business-outline" size={22} color={colors.primary} />
            </View>
            <Text style={styles.brandMark}>UMS</Text>
          </View>
          <Text style={styles.title}>University{"\n"}Management</Text>
          <Text style={styles.tagline}>
            A modern portal for students, faculty, and administrators. Sign in to access your dashboard.
          </Text>
        </FadeInView>

        {hasSession && (
          <FadeInView delay={80} style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>Continue your session</Text>
            {studentData && (
              <Pressable style={styles.continueBtn} onPress={() => navigation.navigate("StudentTabs")}>
                <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
                <Text style={styles.continueBtnText}>Student dashboard</Text>
              </Pressable>
            )}
            {instructorData && (
              <Pressable style={[styles.continueBtn, { backgroundColor: colors.instructor }]} onPress={() => navigation.navigate("InstructorTabs")}>
                <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
                <Text style={styles.continueBtnText}>Instructor dashboard</Text>
              </Pressable>
            )}
            {adminData && (
              <Pressable style={[styles.continueBtn, { backgroundColor: colors.admin }]} onPress={() => navigation.navigate("AdminTabs")}>
                <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
                <Text style={styles.continueBtnText}>Admin dashboard</Text>
              </Pressable>
            )}
          </FadeInView>
        )}

        <FadeInView delay={140}>
          <Text style={styles.sectionEyebrow}>Get started</Text>
          <Text style={styles.sectionTitle}>Choose your role</Text>
        </FadeInView>

        {roles.map((role, i) => (
          <FadeInView key={role.key} delay={180 + i * 70}>
            <Pressable
              style={({ pressed }) => [styles.roleCard, pressed && styles.roleCardPressed]}
              onPress={() => navigation.navigate(role.route)}
            >
              <View style={[styles.roleIconWrap, { backgroundColor: `${role.color}18` }]}>
                <Ionicons name={role.icon} size={24} color={role.color} />
              </View>
              <View style={styles.roleBody}>
                <Text style={styles.roleName}>{role.title}</Text>
                <Text style={styles.roleDesc}>{role.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          </FadeInView>
        ))}

        {hasSession && (
          <FadeInView delay={400} style={styles.signOutBlock}>
            {studentData && (
              <Pressable onPress={() => void signOutStudent()}>
                <Text style={styles.signOutText}>Sign out student</Text>
              </Pressable>
            )}
            {instructorData && (
              <Pressable onPress={() => void signOutInstructor()}>
                <Text style={styles.signOutText}>Sign out instructor</Text>
              </Pressable>
            )}
            {adminData && (
              <Pressable onPress={() => void signOutAdmin()}>
                <Text style={styles.signOutText}>Sign out administrator</Text>
              </Pressable>
            )}
          </FadeInView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: 48 },
  loaderWrap: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: spacing.md },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMark: { fontSize: 14, fontWeight: "800", color: colors.primary, letterSpacing: 2 },
  title: { ...typography.hero, color: colors.text, marginBottom: 12 },
  tagline: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg, maxWidth: 340 },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    ...shadow.card,
  },
  sessionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 4 },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.md,
  },
  continueBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  sectionEyebrow: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  roleCardPressed: { backgroundColor: colors.primarySoft, borderColor: colors.primaryMuted },
  roleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  roleBody: { flex: 1 },
  roleName: { fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: 4 },
  roleDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  signOutBlock: { marginTop: spacing.xl, alignItems: "center", gap: 12 },
  signOutText: { color: colors.danger, fontWeight: "600", fontSize: 14 },
});
