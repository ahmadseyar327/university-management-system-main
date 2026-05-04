import { Ionicons } from "@expo/vector-icons";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { courseEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import LoadingView from "../components/LoadingView";
import SlideOverDetail from "../components/SlideOverDetail";
import { useAuth } from "../contexts/AuthContext";
import type { StudentTabParamList } from "../navigation/types";
import { mongoId } from "../utils/mongoId";
import { toastError } from "../utils/toasts";

type Row = Record<string, unknown>;
type Props = DrawerScreenProps<StudentTabParamList, "StudentCourses">;

function courseTitle(row: Row) {
  return String(row.title ?? "Untitled course");
}

export default function StudentCoursesListScreen(_props: Props) {
  const { studentData } = useAuth();
  const studentId = mongoId(studentData);
  const [courses, setCourses] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<Row | null>(null);
  const firstFocus = useRef(true);

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

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading && courses.length === 0) return <LoadingView />;

  return (
    <View style={styles.screen}>
      <FlatList
        data={courses}
        keyExtractor={(item, i) => String(item._id ?? i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No registered courses yet.</Text>}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => setDetail(item)}
            android_ripple={{ color: "#e2e8f0" }}
          >
            <Text style={styles.rowName} numberOfLines={1}>
              {courseTitle(item)}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </Pressable>
        )}
      />

      <SlideOverDetail open={detail !== null} onClosed={() => setDetail(null)}>
        {detail ? (
          <>
            <Text style={styles.detailEyebrow}>Course</Text>
            <Text style={styles.detailTitle}>{courseTitle(detail)}</Text>
            <View style={styles.detailCard}>
              <Text style={styles.k}>Code</Text>
              <Text style={styles.v}>{String(detail.code ?? "ï¿½")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Type</Text>
              <Text style={styles.v}>{String(detail.type ?? "ï¿½")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Credit hours</Text>
              <Text style={styles.v}>{String(detail.creditHours ?? "ï¿½")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Fee</Text>
              <Text style={styles.v}>{String(detail.fee ?? "ï¿½")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Instructor</Text>
              <Text style={styles.v}>{String(detail.instructorName ?? "ï¿½")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Registered</Text>
              <Text style={styles.v}>{String(detail.createdAt ?? "ï¿½")}</Text>
            </View>
          </>
        ) : null}
      </SlideOverDetail>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1f5f9" },
  list: { paddingVertical: 8, paddingBottom: 40 },
  empty: { textAlign: "center", color: "#64748b", marginTop: 42, fontSize: 15 },
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
