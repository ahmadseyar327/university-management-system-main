import { Ionicons } from "@expo/vector-icons";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { academicEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import {
  EmptyState,
  FadeInView,
  PrimaryButton,
  ScreenContainer,
  ScreenHeader,
  SlideOverDetail,
} from "../components";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { StudentTabParamList } from "../navigation/types";
import { colors, radius, shadow, spacing } from "../theme";
import { listStyles } from "../theme/listStyles";
import { mongoId } from "../utils/mongoId";

type CourseMark = {
  courseId?: string;
  name?: string;
  code?: string;
  isRepeat?: boolean;
  midExamMarks?: number | null;
  finalExamMarks?: number | null;
  totalMarks?: number | null;
  passFailStatus?: string | null;
  absenceCount?: number | null;
  failReason?: string | null;
  markStatus?: string;
};

type SemesterHistory = {
  semesterNumber?: number;
  semesterTitle?: string;
  isOngoing?: boolean;
  statusLabel?: string;
  courses?: CourseMark[];
};

type HistoryData = {
  program?: { name?: string } | null;
  currentSemester?: number;
  ongoingSemester?: SemesterHistory | null;
  historySemesters?: SemesterHistory[];
};

type Props = DrawerScreenProps<StudentTabParamList, "StudentMarks">;

function markStatus(course: CourseMark) {
  return (
    course.passFailStatus ??
    (course.markStatus === "Unpublished" ? "Unpublished" : "Pending")
  );
}

function failReasonLabel(reason?: string | null) {
  if (reason === "marks") return "Failed exam";
  if (reason === "attendance") return "Failed attendance";
  if (reason === "marks_and_attendance") return "Failed exam & attendance";
  return null;
}

function CourseMarkRow({ course }: { course: CourseMark }) {
  const mid = course.midExamMarks ?? "—";
  const fin = course.finalExamMarks ?? "—";
  const total = course.totalMarks ?? "—";
  const reason = failReasonLabel(course.failReason);

  return (
    <View style={[styles.row, shadow.soft]}>
      <Text style={styles.code}>{course.code}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>
          {course.name}
          {course.isRepeat ? " (Repeat)" : ""}
        </Text>
        <Text style={styles.meta}>
          Mid {mid}/20 · Final {fin}/80
        </Text>
        {course.absenceCount != null ? (
          <Text style={styles.meta}>{course.absenceCount} absence(s) · max 6</Text>
        ) : null}
        {reason ? <Text style={styles.failReason}>{reason}</Text> : null}
      </View>
      <Text style={styles.score}>
        {total}/100{"\n"}
        <Text style={styles.status}>{markStatus(course)}</Text>
      </Text>
    </View>
  );
}

export default function StudentMarksScreen({ navigation }: Props) {
  const { studentData } = useAuth();
  const studentId = mongoId(studentData);
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<SemesterHistory | null>(null);

  const load = useCallback(async () => {
    if (!studentId) return;
    const res = await fetchResponse(academicEndpoints.getSemesterHistory(studentId), 0, null);
    if (!res?.success) {
      setHistory(null);
      return;
    }
    setHistory(res.data as HistoryData);
  }, [studentId]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  if (loading) return <LoadingView />;

  if (!history) {
    return (
      <ScreenContainer>
        <ScreenHeader title="My marks" subtitle="Semester results" />
        <EmptyState icon="document-text-outline" title="Enroll in a program to view marks." />
        <PrimaryButton title="Enroll in program" onPress={() => navigation.navigate("StudentRegister")} />
      </ScreenContainer>
    );
  }

  const ongoing = history.ongoingSemester;
  const past = [...(history.historySemesters ?? [])].reverse();

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="My marks"
          subtitle={
            history.program?.name
              ? `${history.program.name} · Sem ${history.currentSemester ?? "—"}`
              : "Semester course marks"
          }
        />

        {ongoing ? (
          <FadeInView>
            <Text style={styles.sectionTitle}>Current semester</Text>
            <Pressable
              style={[styles.semesterCard, shadow.soft]}
              onPress={() => setSelectedSemester(ongoing)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.semesterName}>
                  Semester {ongoing.semesterNumber} · {ongoing.semesterTitle}
                </Text>
                <Text style={styles.semesterSub}>
                  {ongoing.courses?.length ?? 0} course(s) · tap to view marks
                </Text>
              </View>
              <View style={styles.ongoingBadge}>
                <Text style={styles.ongoingBadgeText}>Ongoing</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </Pressable>
          </FadeInView>
        ) : null}

        <FadeInView delay={80}>
          <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>History</Text>
          <Text style={styles.sectionSub}>Past semesters — tap to view course marks</Text>

          {past.length === 0 ? (
            <EmptyState icon="time-outline" title="No past semesters yet." />
          ) : (
            past.map((semester) => (
              <Pressable
                key={semester.semesterNumber}
                style={[styles.semesterCard, shadow.soft]}
                onPress={() => setSelectedSemester(semester)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.semesterName}>
                    Semester {semester.semesterNumber} · {semester.semesterTitle}
                  </Text>
                  <Text style={styles.semesterSub}>
                    {semester.courses?.length ?? 0} course(s)
                  </Text>
                </View>
                <View style={styles.historyBadge}>
                  <Text style={styles.historyBadgeText} numberOfLines={1}>
                    {semester.statusLabel ?? "Completed"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </Pressable>
            ))
          )}
        </FadeInView>
      </ScrollView>

      <SlideOverDetail open={selectedSemester !== null} onClosed={() => setSelectedSemester(null)}>
        {selectedSemester ? (
          <>
            <Text style={listStyles.detailEyebrow}>
              {selectedSemester.isOngoing ? "Ongoing" : "History"}
            </Text>
            <Text style={listStyles.detailTitle}>
              Semester {selectedSemester.semesterNumber}
            </Text>
            <Text style={styles.detailSub}>{selectedSemester.semesterTitle}</Text>
            <View style={[styles.badgeRow, { marginBottom: spacing.md }]}>
              <View
                style={[
                  styles.badge,
                  selectedSemester.isOngoing ? styles.ongoingBadge : styles.historyBadge,
                ]}
              >
                <Text
                  style={
                    selectedSemester.isOngoing ? styles.ongoingBadgeText : styles.historyBadgeText
                  }
                >
                  {selectedSemester.statusLabel ?? (selectedSemester.isOngoing ? "Ongoing" : "Completed")}
                </Text>
              </View>
            </View>

            {(selectedSemester.courses ?? []).length === 0 ? (
              <Text style={styles.meta}>No courses for this semester.</Text>
            ) : (
              (selectedSemester.courses ?? []).map((course, idx) => (
                <CourseMarkRow key={course.courseId ?? idx} course={course} />
              ))
            )}
          </>
        ) : null}
      </SlideOverDetail>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontWeight: "700", fontSize: 16, color: colors.text, marginBottom: 4 },
  sectionSub: { color: colors.textSecondary, fontSize: 13, marginBottom: spacing.sm },
  semesterCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  semesterName: { fontWeight: "700", color: colors.text, fontSize: 15 },
  semesterSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  ongoingBadge: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 90,
  },
  ongoingBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.success,
    textTransform: "uppercase",
  },
  historyBadge: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 110,
  },
  historyBadgeText: { fontSize: 10, fontWeight: "700", color: colors.textSecondary },
  badgeRow: { flexDirection: "row" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  detailSub: { color: colors.textSecondary, fontSize: 14, marginBottom: spacing.sm },
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
  meta: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  score: { textAlign: "right", fontWeight: "700", color: colors.text, fontSize: 13 },
  status: { fontWeight: "500", color: colors.textSecondary, fontSize: 11 },
  failReason: { color: colors.danger, fontSize: 11, marginTop: 2, fontWeight: "600" },
});
