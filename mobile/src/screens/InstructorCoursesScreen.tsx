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
import type { InstructorTabParamList } from "../navigation/types";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Row = Record<string, unknown>;

type Props = DrawerScreenProps<InstructorTabParamList, "InstructorCourses">;

export default function InstructorCoursesScreen(_props: Props) {
  const { instructorData } = useAuth();
  const instructorId = mongoId(instructorData);
  const [offered, setOffered] = useState<Row[]>([]);
  const [catalog, setCatalog] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [r1, r2] = await Promise.all([
      fetchResponse(courseEndpoints.getCoursesOfInstructor(instructorId), 0, null),
      fetchResponse(courseEndpoints.getCourses(), 0, null),
    ]);
    if (r1?.success) {
      const d = (r1.data as Row[]) ?? [];
      setOffered([...d].sort((a, b) => String(a.title).localeCompare(String(b.title))));
    } else {
      toastError(r1?.message ?? "Could not load your courses");
      setOffered([]);
    }
    if (r2?.success) {
      const d = (r2.data as Row[]) ?? [];
      setCatalog([...d].sort((a, b) => String(a.title).localeCompare(String(b.title))));
    } else {
      setCatalog([]);
    }
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

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const offeredIds = new Set(offered.map((o) => mongoId(o)));
  const toOffer = catalog.filter((c) => !offeredIds.has(mongoId(c)));

  async function offer(item: Row) {
    const courseId = mongoId(item);
    Alert.alert("Offer course", `Offer ${String(item.title)}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Offer",
        onPress: async () => {
          const res = await fetchResponse(courseEndpoints.offerCourse(), 1, {
            instructorId,
            courseId,
          });
          if (!res?.success) {
            toastError(res?.message ?? "Failed");
            return;
          }
          toastSuccess(res.message ?? "Offered");
          await load();
        },
      },
    ]);
  }

  if (loading) return <LoadingView />;

  return (
    <FlatList
      data={[{ key: "offered" }, { key: "catalog" }]}
      keyExtractor={(i) => i.key}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.outer}
      renderItem={({ item }) =>
        item.key === "offered" ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your offered courses</Text>
            {offered.length === 0 ? (
              <Text style={styles.empty}>None yet — offer from catalog below.</Text>
            ) : (
              offered.map((row) => (
                <View key={mongoId(row)} style={styles.card}>
                  <Text style={styles.title}>{String(row.title)}</Text>
                  <Text style={styles.meta}>
                    {String(row.code)} · {String(row.type)} · {String(row.creditHours)} cr
                  </Text>
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catalog — tap to offer</Text>
            {toOffer.length === 0 ? (
              <Text style={styles.empty}>All catalog courses are offered or catalog empty.</Text>
            ) : (
              toOffer.map((row) => (
                <View key={mongoId(row)} style={styles.card}>
                  <Text style={styles.title}>{String(row.title)}</Text>
                  <Text style={styles.meta}>
                    {String(row.code)} · {String(row.type)} · Fee {String(row.fee)}
                  </Text>
                  <Pressable style={styles.btn} onPress={() => void offer(row)}>
                    <Text style={styles.btnText}>Offer this course</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  outer: { padding: 16, paddingBottom: 40, backgroundColor: "#f7fafc" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1a202c", marginBottom: 12 },
  empty: { color: "#718096" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#1a202c" },
  meta: { fontSize: 13, color: "#4a5568", marginTop: 4 },
  btn: {
    marginTop: 10,
    backgroundColor: "#1a365d",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
