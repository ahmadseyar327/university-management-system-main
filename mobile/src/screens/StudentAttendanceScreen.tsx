import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
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

type Props = BottomTabScreenProps<StudentTabParamList, "StudentAttendance">;

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
          return da - db;
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
      <SimpleSelect label="Course | Instructor" options={opts} value={courseId} onChange={setCourseId} />
      {loadingAtt ? (
        <LoadingView />
      ) : (
        <FlatList
          data={rows}
          scrollEnabled={false}
          keyExtractor={(_, i) => String(i)}
          ListHeaderComponent={
            <View style={styles.tableHead}>
              <Text style={[styles.th, styles.colDate]}>Date</Text>
              <Text style={[styles.th, styles.colStat]}>Status</Text>
            </View>
          }
          ListEmptyComponent={
            courseId ? (
              <Text style={styles.empty}>No attendance rows.</Text>
            ) : (
              <Text style={styles.empty}>Select a course.</Text>
            )
          }
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={[styles.td, styles.colDate]}>{String(item.date ?? "")}</Text>
              <Text style={[styles.td, styles.colStat]}>{String(item.attendance ?? "")}</Text>
            </View>
          )}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#fff" },
  inner: { padding: 16, paddingBottom: 40 },
  tableHead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#cbd5e0", paddingVertical: 8 },
  th: { fontWeight: "700", color: "#2d3748" },
  tableRow: { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#edf2f7" },
  td: { color: "#4a5568" },
  colDate: { flex: 2 },
  colStat: { flex: 1 },
  empty: { color: "#718096", marginTop: 16, textAlign: "center" },
});
