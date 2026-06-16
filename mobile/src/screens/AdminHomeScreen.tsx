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
import type { AdminTabParamList } from "../navigation/types";
import { colors, spacing } from "../theme";

type Props = DrawerScreenProps<AdminTabParamList, "AdminOverview">;

function fmt(v: unknown): string {
  if (v == null) return "—";
  return String(v);
}

export default function AdminHomeScreen({ navigation }: Props) {
  const { adminData } = useAuth();
  const name = `${fmt(adminData?.fname)} ${fmt(adminData?.lname)}`.trim();
  const initials = `${String(adminData?.fname ?? "").charAt(0)}${String(adminData?.lname ?? "").charAt(0)}`.toUpperCase();

  return (
    <ScreenContainer>
      <DashboardHero
        name={name}
        subtitle="Administrator portal"
        initials={initials || "AD"}
        accentColor={colors.admin}
      />

      <View style={styles.statGrid}>
        <StatCard icon="mail-outline" label="Email" value={fmt(adminData?.email)} delay={80} />
        <StatCard icon="shield-checkmark-outline" label="Role" value="System admin" delay={120} />
      </View>

      <View style={styles.actions}>
        <QuickActionCard icon="school-outline" label="Programs" onPress={() => navigation.navigate("AdminPrograms")} delay={140} />
        <QuickActionCard icon="calendar-outline" label="Semester" onPress={() => navigation.navigate("AdminSemester")} delay={160} />
        <QuickActionCard icon="people-outline" label="Instructors" onPress={() => navigation.navigate("AdminInstructors")} delay={180} />
        <QuickActionCard icon="notifications-outline" label="Offers" onPress={() => navigation.navigate("AdminOfferRequests")} delay={200} />
        <QuickActionCard icon="library-outline" label="Courses" onPress={() => navigation.navigate("AdminCourses")} delay={220} />
        <QuickActionCard icon="person-add-outline" label="Register" onPress={() => navigation.navigate("AdminRegInstructor")} delay={240} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
