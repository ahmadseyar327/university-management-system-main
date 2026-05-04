import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { courseEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { StudentTabParamList } from "../navigation/types";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Row = Record<string, unknown> & { _id?: string; instructorId?: string };

type Props = DrawerScreenProps<StudentTabParamList, "StudentRegister">;

export default function StudentRegisterCourseScreen(_props: Props) {
  const { studentData } = useAuth();
  const studentId = mongoId(studentData);
  const [courses, setCourses] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await fetchResponse(courseEndpoints.getOfferedCourses(), 0, null);
    if (!res?.success) {
      toastError(res?.message ?? "Could not load offered courses");
      setCourses([]);
      return;
    }
    const data = (res.data as Row[]) ?? [];
    setCourses(
      [...data].sort((a, b) => {
        const t = String(a.title).localeCompare(String(b.title));
        return t !== 0 ? t : String(a.instructorName).localeCompare(String(b.instructorName));
      })
    );
  }, []);

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

  async function register(item: Row) {
    const courseId = mongoId(item);
    const instructorId =
      typeof item.instructorId === "string"
        ? item.instructorId
        : mongoId(item.instructorId as Record<string, unknown> | undefined);
    if (!courseId || !instructorId) {
      toastError("Missing course or instructor id.");
      return;
    }
    Alert.alert("Register course", `Register for ${String(item.title)}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Register",
        onPress: async () => {
          const res = await fetchResponse(courseEndpoints.registerCourseByStudent(), 1, {
            studentId,
            courseId,
            instructorId,
          });
          if (!res?.success) {
            toastError(res?.message ?? "Registration failed");
            return;
          }
          toastSuccess(res.message ?? "Registered");
          await load();
        },
      },
    ]);
  }

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
      ListEmptyComponent={<Text style={styles.empty}>No offered courses.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{String(item.title ?? "")}</Text>
          <Text style={styles.meta}>
            {String(item.code ?? "")} · {String(item.type ?? "")} · {String(item.creditHours ?? "")} cr
          </Text>
          <Text style={styles.meta}>Fee: {String(item.fee ?? "")}</Text>
          <Text style={styles.meta}>Instructor: {String(item.instructorName ?? "")}</Text>
          <Pressable style={styles.btn} onPress={() => void register(item)}>
            <Text style={styles.btnText}>Register</Text>
          </Pressable>
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
  btn: {
    marginTop: 12,
    backgroundColor: "#1a365d",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
