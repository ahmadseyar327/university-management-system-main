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
import type { InstructorTabParamList } from "../navigation/types";
import { colors, spacing } from "../theme";

type Props = DrawerScreenProps<InstructorTabParamList, "InstructorOverview">;

function fmt(v: unknown): string {
  if (v == null) return "—";
  return String(v);
}

export default function InstructorHomeScreen({ navigation }: Props) {
  const { instructorData } = useAuth();
  const name = `${fmt(instructorData?.fname)} ${fmt(instructorData?.lname)}`.trim();
  const initials = `${String(instructorData?.fname ?? "").charAt(0)}${String(instructorData?.lname ?? "").charAt(0)}`.toUpperCase();

  return (
    <ScreenContainer>
      <DashboardHero
        name={name}
        subtitle="Instructor portal"
        initials={initials || "IN"}
        accentColor={colors.instructor}
      />

      <View style={styles.statGrid}>
        <StatCard icon="mail-outline" label="Email" value={fmt(instructorData?.email)} delay={80} />
        <StatCard icon="calendar-outline" label="Member since" value={fmt(instructorData?.createdAt)} delay={120} />
      </View>

      <View style={styles.actions}>
        <QuickActionCard icon="book-outline" label="Courses" onPress={() => navigation.navigate("InstructorCourses")} delay={160} />
        <QuickActionCard icon="people-outline" label="Students" onPress={() => navigation.navigate("InstructorStudents")} delay={200} />
        <QuickActionCard icon="stats-chart-outline" label="Marks" onPress={() => navigation.navigate("InstructorMarks")} delay={240} />
        <QuickActionCard icon="calendar-outline" label="Attendance" onPress={() => navigation.navigate("InstructorAttendance")} delay={280} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
