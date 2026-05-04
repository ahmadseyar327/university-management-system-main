import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { studentEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import SimpleSelect, { SelectOption } from "../components/SimpleSelect";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { StudentTabParamList } from "../navigation/types";
import { examTypes } from "../utils/constants";
import { mongoId } from "../utils/mongoId";
import { toastError } from "../utils/toasts";

type CourseOpt = { courseId: string; title: string; instructor: string };
type MarkRow = Record<string, unknown>;

type Props = BottomTabScreenProps<StudentTabParamList, "StudentMarks">;

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
    <ScrollView style={styles.wrap} contentContainerStyle={styles.inner}>
      <SimpleSelect label="Course | Instructor" options={opts} value={courseId} onChange={setCourseId} />
      <Text style={styles.section}>Exam components</Text>
      {examTypeList.map((exam) => {
        const expanded = openExam === exam;
        const rows = marksByExam[exam];
        return (
          <View key={exam} style={styles.acc}>
            <Pressable
              style={styles.accHead}
              onPress={() => {
                setOpenExam(expanded ? null : exam);
                if (!expanded && rows === undefined) void loadExam(exam);
              }}
            >
              <Text style={styles.accTitle}>{exam}</Text>
              <Text style={styles.accChev}>{expanded ? "▾" : "▸"}</Text>
            </Pressable>
            {expanded && (
              <View style={styles.accBody}>
                {loadingExam === exam ? (
                  <ActivityIndicator color="#1a365d" />
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
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#fff" },
  inner: { padding: 16, paddingBottom: 40 },
  section: { marginTop: 8, marginBottom: 8, fontWeight: "700", color: "#2d3748" },
  acc: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, marginBottom: 10, overflow: "hidden" },
  accHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: "#edf2f7",
  },
  accTitle: { fontWeight: "600", color: "#1a202c" },
  accChev: { color: "#718096" },
  accBody: { padding: 12 },
  markRow: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f7fafc" },
  markCell: { flex: 1, fontSize: 13, color: "#4a5568" },
});
