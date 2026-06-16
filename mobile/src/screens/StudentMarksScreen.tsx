import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { academicEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { EmptyState, FadeInView, PrimaryButton, ScreenContainer, ScreenHeader } from "../components";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { StudentTabParamList } from "../navigation/types";
import { colors, radius, shadow, spacing } from "../theme";
import { mongoId } from "../utils/mongoId";
import { toastError } from "../utils/toasts";

type Course = { id?: string; name?: string; code?: string };
type Result = {
  courseId?: string;
  midExamMarks?: number;
  finalExamMarks?: number;
  totalMarks?: number;
  passFailStatus?: string;
  isPublished?: boolean;
};
type Dashboard = {
  currentSemester?: number;
  semesterTitle?: string;
  promotionStatus?: string;
  courses?: Course[];
  results?: Result[];
};

type Props = DrawerScreenProps<StudentTabParamList, "StudentMarks">;

export default function StudentMarksScreen({ navigation }: Props) {
  const { studentData } = useAuth();
  const studentId = mongoId(studentData);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!studentId) return;
    const res = await fetchResponse(academicEndpoints.getStudentDashboard(studentId), 0, null);
    if (!res?.success) {
      setDashboard(null);
      return;
    }
    setDashboard(res.data as Dashboard);
  }, [studentId]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  if (loading) return <LoadingView />;

  if (!dashboard) {
    return (
      <ScreenContainer>
        <ScreenHeader title="My marks" subtitle="Semester results" onBack={() => navigation.goBack()} />
        <EmptyState icon="document-text-outline" title="Enroll in a program to view marks." />
        <PrimaryButton title="Enroll in program" onPress={() => navigation.navigate("StudentRegister")} />
      </ScreenContainer>
    );
  }

  const resultsByCourse: Record<string, Result> = {};
  (dashboard.results ?? []).forEach((r) => {
    if (r.courseId) resultsByCourse[r.courseId] = r;
  });

  return (
    <ScreenContainer>
      <ScreenHeader
        title="My marks"
        subtitle={`Semester ${dashboard.currentSemester ?? ""} · ${dashboard.promotionStatus ?? "PENDING"}`}
        onBack={() => navigation.goBack()}
      />

      <FadeInView>
        <View style={[styles.panel, shadow.soft]}>
          <Text style={styles.step}>{dashboard.semesterTitle ?? "Current semester"}</Text>
          <Text style={styles.meta}>Mid exam max 20 · Final max 80 · Pass at 55/100</Text>
        </View>
      </FadeInView>

      {(dashboard.courses ?? []).length === 0 ? (
        <EmptyState icon="document-text-outline" title="No courses this semester." />
      ) : (
        (dashboard.courses ?? []).map((course, idx) => {
          const result = resultsByCourse[course.id ?? ""];
          const status = result?.passFailStatus ?? (result?.isPublished === false ? "Unpublished" : "Pending");
          return (
            <FadeInView key={course.id ?? idx} delay={80 + idx * 40}>
              <View style={[styles.row, shadow.soft]}>
                <Text style={styles.code}>{course.code}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{course.name}</Text>
                  <Text style={styles.meta}>
                    Mid {result?.midExamMarks ?? "—"}/20 · Final {result?.finalExamMarks ?? "—"}/80
                  </Text>
                </View>
                <Text style={styles.score}>
                  {result?.totalMarks ?? "—"}/100{"\n"}
                  <Text style={styles.status}>{status}</Text>
                </Text>
              </View>
            </FadeInView>
          );
        })
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  step: { fontWeight: "700", color: colors.text, fontSize: 15 },
  meta: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  code: { width: 56, fontWeight: "700", color: colors.textMuted, fontSize: 12 },
  name: { fontWeight: "600", color: colors.text, fontSize: 14 },
  score: { textAlign: "right", fontWeight: "700", color: colors.text, fontSize: 13 },
  status: { fontWeight: "500", color: colors.textSecondary, fontSize: 11 },
});
