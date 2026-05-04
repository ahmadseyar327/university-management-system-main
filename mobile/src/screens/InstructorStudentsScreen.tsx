import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { courseEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import SimpleSelect, { SelectOption } from "../components/SimpleSelect";
import LoadingView from "../components/LoadingView";
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

type Props = BottomTabScreenProps<InstructorTabParamList, "InstructorStudents">;

export default function InstructorStudentsScreen(_props: Props) {
  const { instructorData } = useAuth();
  const instructorId = mongoId(instructorData);
  const [rows, setRows] = useState<Row[]>([]);
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetchResponse(courseEndpoints.getStudentsOfInstructor(instructorId), 0, null);
    if (!res?.success) {
      toastError(res?.message ?? "Could not load students");
      setRows([]);
      return;
    }
    const data = (res.data as Row[]) ?? [];
    setRows(
      [...data]
        .sort((a, b) => {
          const fn = String(a.fname).localeCompare(String(b.fname));
          return fn !== 0 ? fn : String(a.lname).localeCompare(String(b.lname));
        })
        .map((s) => ({
          ...s,
          name: `${String(s.fname ?? "")} ${String(s.lname ?? "")}`.trim(),
        }))
    );
  }, [instructorId]);

  useEffect(() => {
    let c = false;
    (async () => {
      setLoading(true);
      await load();
      if (!c) setLoading(false);
    })();
    return () => {
      c = true;
    };
  }, [load]);

  const seen = new Set<string>();
  const courseOptions: SelectOption[] = rows
    .filter((r) => {
      const id = String(r.courseId ?? "");
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .sort((a, b) => String(a.courseTitle).localeCompare(String(b.courseTitle)))
    .map((r) => ({ label: String(r.courseTitle ?? ""), value: String(r.courseId ?? "") }));

  const filtered = courseId ? rows.filter((r) => String(r.courseId) === courseId) : [];

  if (loading) return <LoadingView />;

  return (
    <View style={styles.wrap}>
      <View style={styles.pad}>
        <SimpleSelect label="Course" options={courseOptions} value={courseId} onChange={setCourseId} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item, i) => String(item._id ?? i)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>{courseId ? "No students in this course." : "Select a course."}</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{String(item.name)}</Text>
            <Text style={styles.meta}>Roll: {String(item.rollNumber ?? "")}</Text>
            <Text style={styles.meta}>{String(item.email ?? "")}</Text>
            <Text style={styles.date}>{String(item.createdAt ?? "")}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#fff" },
  pad: { padding: 16, paddingBottom: 0 },
  list: { padding: 16, paddingTop: 8 },
  empty: { textAlign: "center", color: "#718096", marginTop: 24 },
  card: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  name: { fontWeight: "700", fontSize: 16, color: "#1a202c" },
  meta: { color: "#4a5568", marginTop: 4 },
  date: { color: "#a0aec0", fontSize: 12, marginTop: 4 },
});
