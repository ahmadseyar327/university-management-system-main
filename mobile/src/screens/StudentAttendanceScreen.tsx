import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { studentEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import {
  EmptyState,
  FadeInView,
  ScreenContainer,
  ScreenHeader,
  SimpleSelect,
} from "../components";
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
    return { bg: colors.successSoft, fg: colors.success, border: colors.success, label: "Present" };
  if (s.startsWith("A"))
    return { bg: colors.dangerSoft, fg: colors.danger, border: colors.danger, label: "Absent" };
  if (s.startsWith("L"))
    return { bg: colors.warningSoft, fg: colors.warning, border: colors.warning, label: "Late" };
  return { bg: colors.borderLight, fg: colors.textSecondary, border: colors.border, label: raw || "—" };
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

  const summary = rows.reduce<{ p: number; a: number; l: number }>(
    (acc, row) => {
      const s = String(row.attendance ?? "").toUpperCase();
      if (s.startsWith("P")) acc.p += 1;
      else if (s.startsWith("A")) acc.a += 1;
      else if (s.startsWith("L")) acc.l += 1;
      return acc;
    },
    { p: 0, a: 0, l: 0 }
  );

  if (loadingMeta) return <LoadingView />;

  return (
    <ScreenContainer>
      <ScreenHeader title="My attendance" subtitle="Session history for each course." />

      <FadeInView>
        <View style={[styles.panel, shadow.soft]}>
          <Text style={styles.step}>1 · Select course</Text>
          <SimpleSelect label="Course | Instructor" options={opts} value={courseId} onChange={setCourseId} />
        </View>
      </FadeInView>

      {courseId && rows.length > 0 ? (
        <FadeInView delay={60}>
          <View style={styles.summary}>
            <View style={[styles.pill, styles.pillP]}>
              <Text style={styles.pillTxtP}>P {summary.p}</Text>
            </View>
            <View style={[styles.pill, styles.pillA]}>
              <Text style={styles.pillTxtA}>A {summary.a}</Text>
            </View>
            <View style={[styles.pill, styles.pillL]}>
              <Text style={styles.pillTxtL}>L {summary.l}</Text>
            </View>
            <Text style={styles.count}>{rows.length} sessions</Text>
          </View>
        </FadeInView>
      ) : null}

      <FadeInView delay={100}>
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
                  title="No records yet"
                  message="No sessions recorded for this course."
                />
              ) : (
                <EmptyState icon="list-outline" title="Select a course" message="Choose a course above." />
              )
            }
            renderItem={({ item, index }) => {
              const stat = String(item.attendance ?? "");
              const palette = statusStyles(stat);
              const dateStr = String(item.date ?? "").slice(0, 10);
              return (
                <FadeInView delay={120 + index * 40}>
                  <View style={[styles.card, shadow.soft]}>
                    <View style={styles.cardRow}>
                      <View style={styles.dateCol}>
                        <Text style={styles.dateLabel}>Session</Text>
                        <Text style={styles.dateValue}>{dateStr}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
                        <Text style={[styles.badgeTxt, { color: palette.fg }]}>{palette.label}</Text>
                      </View>
                    </View>
                  </View>
                </FadeInView>
              );
            }}
          />
        )}
      </FadeInView>
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
  step: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  summary: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  pillP: { backgroundColor: colors.successSoft },
  pillA: { backgroundColor: colors.dangerSoft },
  pillL: { backgroundColor: colors.warningSoft },
  pillTxtP: { fontSize: 12, fontWeight: "700", color: colors.success },
  pillTxtA: { fontSize: 12, fontWeight: "700", color: colors.danger },
  pillTxtL: { fontSize: 12, fontWeight: "700", color: colors.warning },
  count: { marginLeft: "auto", fontSize: 12, color: colors.textSecondary, fontWeight: "600" },
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
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateValue: { marginTop: 4, fontSize: 16, fontWeight: "700", color: colors.text },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1.5,
    minWidth: 72,
    alignItems: "center",
  },
  badgeTxt: { fontWeight: "800", fontSize: 13 },
});
