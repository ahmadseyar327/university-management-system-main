import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { courseEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { StudentTabParamList } from "../navigation/types";
import { mongoId } from "../utils/mongoId";
import { toastError } from "../utils/toasts";

type Row = Record<string, unknown>;

type Props = BottomTabScreenProps<StudentTabParamList, "StudentCourses">;

export default function StudentCoursesListScreen(_props: Props) {
  const { studentData } = useAuth();
  const studentId = mongoId(studentData);
  const [courses, setCourses] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!studentId) return;
    const res = await fetchResponse(courseEndpoints.getCoursesOfStudent(studentId), 0, null);
    if (!res?.success) {
      toastError(res?.message ?? "Could not load courses");
      setCourses([]);
      return;
    }
    const data = (res.data as Row[]) ?? [];
    setCourses([...data].sort((a, b) => String(a.title).localeCompare(String(b.title))));
  }, [studentId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) return <LoadingView />;

  return (
    <FlatList
      data={courses}
      keyExtractor={(item, i) => String(item._id ?? i)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No registered courses yet.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{String(item.title ?? "")}</Text>
          <Text style={styles.meta}>
            {String(item.code ?? "")} · {String(item.type ?? "")} · {String(item.creditHours ?? "")} cr
          </Text>
          <Text style={styles.meta}>Fee: {String(item.fee ?? "")}</Text>
          <Text style={styles.meta}>Instructor: {String(item.instructorName ?? "")}</Text>
          <Text style={styles.date}>Registered: {String(item.createdAt ?? "")}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 32, backgroundColor: "#f7fafc" },
  empty: { textAlign: "center", color: "#718096", marginTop: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  title: { fontSize: 17, fontWeight: "700", color: "#1a202c", marginBottom: 6 },
  meta: { fontSize: 14, color: "#4a5568", marginBottom: 2 },
  date: { fontSize: 12, color: "#718096", marginTop: 6 },
});
