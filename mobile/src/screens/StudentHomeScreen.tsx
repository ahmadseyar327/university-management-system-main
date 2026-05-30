import type { DrawerScreenProps } from "@react-navigation/drawer";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  DashboardHero,
  QuickActionCard,
  ScreenContainer,
  StatCard,
} from "../components";
import { useAuth } from "../contexts/AuthContext";
import type { StudentTabParamList } from "../navigation/types";
import { colors, spacing } from "../theme";

type Props = DrawerScreenProps<StudentTabParamList, "StudentOverview">;

function fmt(v: unknown): string {
  if (v == null) return "—";
  return String(v);
}

export default function StudentHomeScreen({ navigation }: Props) {
  const { studentData } = useAuth();
  const name = `${fmt(studentData?.fname)} ${fmt(studentData?.lname)}`.trim();
  const initials = `${String(studentData?.fname ?? "").charAt(0)}${String(studentData?.lname ?? "").charAt(0)}`.toUpperCase();

  return (
    <ScreenContainer>
      <DashboardHero
        name={name}
        subtitle="Student portal"
        initials={initials || "ST"}
        accentColor={colors.primary}
      />

      <View style={styles.statGrid}>
        <StatCard icon="id-card-outline" label="Roll number" value={fmt(studentData?.rollNumber)} delay={80} />
        <StatCard icon="mail-outline" label="Email" value={fmt(studentData?.email)} delay={120} />
      </View>

      <View style={styles.actions}>
        <QuickActionCard icon="library-outline" label="My courses" onPress={() => navigation.navigate("StudentCourses")} delay={160} />
        <QuickActionCard icon="add-circle-outline" label="Register" onPress={() => navigation.navigate("StudentRegister")} delay={200} />
        <QuickActionCard icon="bar-chart-outline" label="Marks" onPress={() => navigation.navigate("StudentMarks")} delay={240} />
        <QuickActionCard icon="calendar-outline" label="Attendance" onPress={() => navigation.navigate("StudentAttendance")} delay={280} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
