import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { studentEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { ActivityCard, EmptyState, ScreenContainer, ScreenHeader, SimpleSelect } from "../components";
import type { SelectOption } from "../components/SimpleSelect";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { StudentTabParamList } from "../navigation/types";
import { colors, radius, shadow, spacing } from "../theme";
import { examTypes } from "../utils/constants";
import { mongoId } from "../utils/mongoId";
import { toastError } from "../utils/toasts";

type CourseOpt = { courseId: string; title: string; instructor: string };
type MarkRow = Record<string, unknown>;

type Props = DrawerScreenProps<StudentTabParamList, "StudentMarks">;

export default function StudentMarksScreen(_props: Props) {
  const { studentData } = useAuth();
  const studentId = mongoId(studentData);
  const [courses, setCourses] = useState<CourseOpt[]>([]);
  const [examTypeList, setExamTypeList] = useState<string[]>([]);
  const [courseId, setCourseId] = useState("");
  const [marksByExam, setMarksByExam] = useState<Record<string, MarkRow[] | undefined>>({});
  const [openExam, setOpenExam] = useState<string | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingExam, setLoadingExam] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingMeta(true);
      const res = await fetchResponse(studentEndpoints.getCourseAndExamTypeNames(studentId), 0, null);
      if (!res?.success) {
        if (!String(res?.message ?? "").toLowerCase().includes("not found")) {
          toastError(res?.message ?? "Could not load data");
        }
        setCourses([]);
        setExamTypeList([]);
      } else {
        const data = res.data as { courses?: CourseOpt[]; examTypes?: string[] };
        setCourses(data?.courses ?? []);
        setExamTypeList(data?.examTypes ?? [...examTypes]);
      }
      if (!cancelled) setLoadingMeta(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  useEffect(() => {
    setMarksByExam({});
    setOpenExam(null);
  }, [courseId]);

  const loadExam = useCallback(
    async (exam: string) => {
      if (!courseId) {
        toastError("Select a course first.");
        return;
      }
      setLoadingExam(exam);
      const res = await fetchResponse(studentEndpoints.getAcademics(studentId, courseId, exam), 0, null);
      if (!res?.success) {
        toastError(res?.message ?? "Could not load marks");
        setMarksByExam((m) => ({ ...m, [exam]: [] }));
      } else {
        const data = (res.data as MarkRow[]) ?? [];
        setMarksByExam((m) => ({
          ...m,
          [exam]: [...data].sort(
            (a, b) => Number(a.activityNumber ?? 0) - Number(b.activityNumber ?? 0)
          ),
        }));
      }
      setLoadingExam(null);
    },
    [courseId, studentId]
  );

  const opts: SelectOption[] = courses.map((c) => ({
    label: `${c.title} | ${c.instructor}`,
    value: c.courseId,
  }));

  if (loadingMeta) return <LoadingView />;

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Marks"
        subtitle="View your marks and grades by course and exam type."
      />

      <View style={[styles.panel, shadow.soft]}>
        <SimpleSelect label="Course | Instructor" options={opts} value={courseId} onChange={setCourseId} />
      </View>

      <Text style={styles.section}>Exam components</Text>

      {examTypeList.length === 0 ? (
        <EmptyState icon="document-text-outline" title="No exam types available." />
      ) : (
        examTypeList.map((exam) => {
          const expanded = openExam === exam;
          const rows = marksByExam[exam];
          return (
            <ActivityCard
              key={exam}
              variant="instructor"
              header={exam}
              isExpanded={expanded}
              onToggle={() => {
                setOpenExam(expanded ? null : exam);
                if (!expanded && rows === undefined) void loadExam(exam);
              }}
            >
              {loadingExam === exam ? (
                <ActivityIndicator color={colors.instructor} />
              ) : (rows ?? []).length === 0 ? (
                <Text style={styles.emptyRow}>No marks recorded yet.</Text>
              ) : (
                (rows ?? []).map((row, idx) => (
                  <View key={idx} style={styles.markRow}>
                    <Text style={styles.markCell}>#{String(row.activityNumber ?? "")}</Text>
                    <Text style={styles.markCell}>W:{String(row.weightage ?? "")}</Text>
                    <Text style={styles.markCell}>Tot:{String(row.totalMarks ?? "")}</Text>
                    <Text style={styles.markCell}>Got:{String(row.marks ?? "")}</Text>
                  </View>
                ))
              )}
            </ActivityCard>
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
  section: { marginBottom: spacing.sm, fontWeight: "700", color: colors.text, fontSize: 15 },
  markRow: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  markCell: { flex: 1, fontSize: 13, color: colors.textSecondary },
  emptyRow: { textAlign: "center", color: colors.textSecondary, paddingVertical: spacing.sm },
});
