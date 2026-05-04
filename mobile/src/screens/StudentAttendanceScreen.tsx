import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { studentEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import SimpleSelect, { SelectOption } from "../components/SimpleSelect";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { StudentTabParamList } from "../navigation/types";
import { mongoId } from "../utils/mongoId";
import { toastError } from "../utils/toasts";

type CourseOpt = { courseId: string; title: string; instructor: string };
type AttRow = Record<string, unknown>;

type Props = DrawerScreenProps<StudentTabParamList, "StudentAttendance">;

function statusStyles(raw: string) {
  const s = String(raw).trim().toUpperCase();
  if (s.startsWith("P"))
    return { bg: "#d1fae5", fg: "#047857", border: "#6ee7b7" };
  if (s.startsWith("A"))
    return { bg: "#fee2e2", fg: "#b91c1c", border: "#fecaca" };
  if (s.startsWith("L"))
    return { bg: "#ffedd5", fg: "#c2410c", border: "#fdba74" };
  return { bg: "#e2e8f0", fg: "#475569", border: "#cbd5e1" };
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
    <ScrollView style={styles.wrap} contentContainerStyle={styles.inner}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Attendance</Text>
        <Text style={styles.heroSub}>Pick a course to see each session and your status.</Text>
      </View>

      <View style={styles.panel}>
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
              <Text style={styles.empty}>No attendance records yet for this course.</Text>
            ) : (
              <Text style={styles.empty}>Select a course to load your attendance.</Text>
            )
          }
          renderItem={({ item }) => {
            const stat = String(item.attendance ?? "");
            const palette = statusStyles(stat);
            return (
              <View style={styles.card}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#f1f5f9" },
  inner: { padding: 16, paddingBottom: 40 },
  hero: { marginBottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  heroSub: { marginTop: 6, fontSize: 14, color: "#64748b", lineHeight: 20 },
  panel: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateCol: { flex: 1, paddingRight: 12 },
  dateLabel: { fontSize: 12, fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.6 },
  dateValue: { marginTop: 4, fontSize: 16, fontWeight: "700", color: "#0f172a" },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    minWidth: 52,
    alignItems: "center",
  },
  badgeTxt: { fontWeight: "800", fontSize: 14 },
  empty: { textAlign: "center", color: "#64748b", marginTop: 24, lineHeight: 20 },
});
