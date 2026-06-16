import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { academicEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import {
  DashboardHero,
  PrimaryButton,
  QuickActionCard,
  ScreenContainer,
  StatCard,
} from "../components";
import { useAuth } from "../contexts/AuthContext";
import type { StudentTabParamList } from "../navigation/types";
import { colors, spacing } from "../theme";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Props = DrawerScreenProps<StudentTabParamList, "StudentOverview">;
type Dashboard = {
  program?: { id?: string; name?: string } | null;
  currentSemester?: number;
  semesterTitle?: string;
  status?: string;
  promotionStatus?: string;
  registrationOpen?: boolean;
  courses?: unknown[];
};

function fmt(v: unknown): string {
  if (v == null) return "—";
  return String(v);
}

export default function StudentHomeScreen({ navigation }: Props) {
  const { studentData } = useAuth();
  const studentId = mongoId(studentData);
  const name = `${fmt(studentData?.fname)} ${fmt(studentData?.lname)}`.trim();
  const initials = `${String(studentData?.fname ?? "").charAt(0)}${String(studentData?.lname ?? "").charAt(0)}`.toUpperCase();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [promoting, setPromoting] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!studentId) return;
    const res = await fetchResponse(academicEndpoints.getStudentDashboard(studentId), 0, null);
    if (res?.success) setDashboard(res.data as Dashboard);
    else setDashboard(null);
  }, [studentId]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function confirmPromotion() {
    if (!studentId) return;
    setPromoting(true);
    try {
      const res = await fetchResponse(academicEndpoints.studentConfirmPromotion(), 1, { studentId });
      if (!res?.success) {
        toastError(res?.message ?? "Promotion failed");
        return;
      }
      toastSuccess(res.message ?? "Promoted to next semester");
      await loadDashboard();
    } finally {
      setPromoting(false);
    }
  }

  const showPromotion =
    dashboard?.status === "Ready For Registration" &&
    dashboard?.registrationOpen &&
    (dashboard?.promotionStatus === "PASSED SEMESTER" ||
      dashboard?.promotionStatus === "COMPLETED WITH REPEATS");

  return (
    <ScreenContainer>
      <DashboardHero
        name={name}
        subtitle={dashboard?.program?.name ? `${dashboard.program.name} · Sem ${dashboard.currentSemester ?? "—"}` : "Student portal"}
        initials={initials || "ST"}
        accentColor={colors.primary}
      />

      {dashboard ? (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>{dashboard.semesterTitle ?? `Semester ${dashboard.currentSemester}`}</Text>
          <Text style={styles.bannerSub}>
            Status: {dashboard.status} · Result: {dashboard.promotionStatus ?? "PENDING"}
          </Text>
          {showPromotion ? (
            <PrimaryButton title="Confirm promotion" loading={promoting} onPress={() => void confirmPromotion()} />
          ) : null}
        </View>
      ) : (
        <View style={styles.banner}>
          <Text style={styles.bannerSub}>Enroll in a program to start semester 1.</Text>
          <PrimaryButton title="Enroll in program" onPress={() => navigation.navigate("StudentRegister")} />
        </View>
      )}

      <View style={styles.statGrid}>
        <StatCard icon="id-card-outline" label="Roll number" value={fmt(studentData?.rollNumber)} delay={80} />
        <StatCard icon="mail-outline" label="Email" value={fmt(studentData?.email)} delay={120} />
      </View>

      <View style={styles.actions}>
        <QuickActionCard icon="library-outline" label="My courses" onPress={() => navigation.navigate("StudentCourses")} delay={160} />
        {!dashboard ? (
          <QuickActionCard icon="school-outline" label="Enroll" onPress={() => navigation.navigate("StudentRegister")} delay={200} />
        ) : null}
        <QuickActionCard icon="bar-chart-outline" label="Marks" onPress={() => navigation.navigate("StudentMarks")} delay={240} />
        <QuickActionCard icon="calendar-outline" label="Attendance" onPress={() => navigation.navigate("StudentAttendance")} delay={280} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  bannerTitle: { fontWeight: "700", color: colors.text, fontSize: 16 },
  bannerSub: { color: colors.textSecondary, fontSize: 13 },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
