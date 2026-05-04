import { Ionicons } from "@expo/vector-icons";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { courseEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import LoadingView from "../components/LoadingView";
import SimpleSelect, { SelectOption } from "../components/SimpleSelect";
import SlideOverDetail from "../components/SlideOverDetail";
import { useAuth } from "../contexts/AuthContext";
import type { InstructorTabParamList } from "../navigation/types";
import { mongoId } from "../utils/mongoId";
import { toastError } from "../utils/toasts";

type Row = Record<string, unknown> & {
  courseId?: string;
  courseTitle?: string;
  fname?: string;
  lname?: string;
  rollNumber?: unknown;
  email?: string;
  createdAt?: string;
};

type Props = DrawerScreenProps<InstructorTabParamList, "InstructorStudents">;

function studentName(item: Row) {
  return `${String(item.fname ?? "").trim()} ${String(item.lname ?? "").trim()}`.trim() || "—";
}

export default function InstructorStudentsScreen(_props: Props) {
  const { instructorData } = useAuth();
  const instructorId = mongoId(instructorData);
  const [rows, setRows] = useState<Row[]>([]);
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Row | null>(null);
  const firstFocus = useRef(true);

  const load = useCallback(async () => {
    const res = await fetchResponse(courseEndpoints.getStudentsOfInstructor(instructorId), 0, null);
    if (!res?.success) {
      toastError(res?.message ?? "Could not load students");
      setRows([]);
      return;
    }
    const data = (res.data as Row[]) ?? [];
    setRows(
      [...data].sort((a, b) => {
        const fn = String(a.fname).localeCompare(String(b.fname));
        return fn !== 0 ? fn : String(a.lname).localeCompare(String(b.lname));
      })
    );
  }, [instructorId]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        if (firstFocus.current) {
          setLoading(true);
          firstFocus.current = false;
        }
        await load();
        if (!cancelled) setLoading(false);
      })();
      return () => {
        cancelled = true;
      };
    }, [load])
  );

  const courseOptions: SelectOption[] = useMemo(() => {
    const seen = new Set<string>();
    return rows
      .filter((r) => {
        const id = String(r.courseId ?? "");
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .sort((a, b) => String(a.courseTitle).localeCompare(String(b.courseTitle)))
      .map((r) => ({ label: String(r.courseTitle ?? ""), value: String(r.courseId ?? "") }));
  }, [rows]);

  const filtered = courseId ? rows.filter((r) => String(r.courseId) === courseId) : [];

  if (loading && rows.length === 0) return <LoadingView />;

  return (
    <View style={styles.screen}>
      <View style={styles.filterBar}>
        <SimpleSelect label="Course" options={courseOptions} value={courseId} onChange={setCourseId} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item, i) => mongoId(item) || `s-${i}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>{courseId ? "No students in this course." : "Select a course to see students."}</Text>
        }
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => setDetail(item)}
            android_ripple={{ color: "#e2e8f0" }}
          >
            <Text style={styles.rowName} numberOfLines={1}>
              {studentName(item)}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </Pressable>
        )}
      />

      <SlideOverDetail open={detail !== null} onClosed={() => setDetail(null)}>
        {detail ? (
          <>
            <Text style={styles.detailEyebrow}>Student</Text>
            <Text style={styles.detailTitle}>{studentName(detail)}</Text>
            <View style={styles.detailCard}>
              <Text style={styles.k}>Roll number</Text>
              <Text style={styles.v}>{String(detail.rollNumber ?? "—")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Email</Text>
              <Text style={styles.v}>{String(detail.email ?? "—")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Course</Text>
              <Text style={styles.v}>{String(detail.courseTitle ?? "—")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Enrolled</Text>
              <Text style={styles.v}>{String(detail.createdAt ?? "—")}</Text>
            </View>
          </>
        ) : null}
      </SlideOverDetail>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1f5f9" },
  filterBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: "#f1f5f9",
  },
  list: { paddingTop: 8, paddingBottom: 40 },
  empty: { textAlign: "center", color: "#64748b", marginTop: 32, fontSize: 15, paddingHorizontal: 24 },
  sep: { height: 1, backgroundColor: "#e2e8f0", marginLeft: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  rowPressed: { backgroundColor: "#f8fafc" },
  rowName: { flex: 1, fontSize: 17, fontWeight: "600", color: "#0f172a", marginRight: 8 },
  detailEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  k: { fontSize: 12, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 },
  v: { fontSize: 16, fontWeight: "600", color: "#0f172a", marginBottom: 14 },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 4 },
});
