import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { studentEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { EmptyState, ScreenContainer, ScreenHeader, SimpleSelect } from "../components";
import type { SelectOption } from "../components/SimpleSelect";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { StudentTabParamList } from "../navigation/types";
import { colors, radius, shadow, spacing } from "../theme";
import { mongoId } from "../utils/mongoId";
import { toastError } from "../utils/toasts";

type CourseOpt = { courseId: string; title: string; instructor: string };
type AttRow = Record<string, unknown>;

type Props = DrawerScreenProps<StudentTabParamList, "StudentAttendance">;

function statusStyles(raw: string) {
  const s = String(raw).trim().toUpperCase();
  if (s.startsWith("P"))
    return { bg: colors.successSoft, fg: colors.success, border: colors.success };
  if (s.startsWith("A"))
    return { bg: colors.dangerSoft, fg: colors.danger, border: colors.danger };
  if (s.startsWith("L"))
    return { bg: colors.warningSoft, fg: colors.warning, border: colors.warning };
  return { bg: colors.borderLight, fg: colors.textSecondary, border: colors.border };
}

export default function StudentAttendanceScreen(_props: Props) {
  const { studentData } = useAuth();
  const studentId = mongoId(studentData);
  const [courses, setCourses] = useState<CourseOpt[]>([]);
  const [courseId, setCourseId] = useState("");
  const [rows, setRows] = useState<AttRow[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingAtt, setLoadingAtt] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingMeta(true);
      const res = await fetchResponse(studentEndpoints.getCourseAndExamTypeNames(studentId), 0, null);
      if (!res?.success) {
        if (!String(res?.message ?? "").toLowerCase().includes("not found")) {
          toastError(res?.message ?? "Could not load courses");
        }
        setCourses([]);
      } else {
        const data = res.data as { courses?: CourseOpt[] };
        setCourses(data?.courses ?? []);
      }
      if (!cancelled) setLoadingMeta(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const loadAtt = useCallback(async () => {
    if (!courseId) {
      setRows([]);
      return;
    }
    setLoadingAtt(true);
    const res = await fetchResponse(studentEndpoints.getAttendances(studentId, courseId), 0, null);
    if (!res?.success) {
      toastError(res?.message ?? "Could not load attendance");
      setRows([]);
    } else {
      const data = (res.data as AttRow[]) ?? [];
      setRows(
        [...data].sort((a, b) => {
          const da = new Date(String(a.date)).getTime();
          const db = new Date(String(b.date)).getTime();
          return db - da;
        })
      );
    }
    setLoadingAtt(false);
  }, [courseId, studentId]);

  useEffect(() => {
    void loadAtt();
  }, [loadAtt]);

  const opts: SelectOption[] = courses.map((c) => ({
    label: `${c.title} | ${c.instructor}`,
    value: c.courseId,
  }));

  if (loadingMeta) return <LoadingView />;

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Attendance"
        subtitle="Pick a course to see each session and your status."
      />

      <View style={[styles.panel, shadow.soft]}>
        <SimpleSelect label="Course | Instructor" options={opts} value={courseId} onChange={setCourseId} />
      </View>

      {loadingAtt ? (
        <LoadingView />
      ) : (
        <FlatList
          data={rows}
          scrollEnabled={false}
          keyExtractor={(_, i) => String(i)}
          ListEmptyComponent={
            courseId ? (
              <EmptyState
                icon="calendar-outline"
                title="No attendance records yet"
                message="No sessions recorded for this course."
              />
            ) : (
              <EmptyState
                icon="list-outline"
                title="Select a course"
                message="Choose a course above to load your attendance."
              />
            )
          }
          renderItem={({ item }) => {
            const stat = String(item.attendance ?? "");
            const palette = statusStyles(stat);
            return (
              <View style={[styles.card, shadow.soft]}>
                <View style={styles.cardRow}>
                  <View style={styles.dateCol}>
                    <Text style={styles.dateLabel}>Session date</Text>
                    <Text style={styles.dateValue}>{String(item.date ?? "").slice(0, 10)}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
                    <Text style={[styles.badgeTxt, { color: palette.fg }]}>{stat || "—"}</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateCol: { flex: 1, paddingRight: 12 },
  dateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  dateValue: { marginTop: 4, fontSize: 16, fontWeight: "700", color: colors.text },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1.5,
    minWidth: 52,
    alignItems: "center",
  },
  badgeTxt: { fontWeight: "800", fontSize: 14 },
});
