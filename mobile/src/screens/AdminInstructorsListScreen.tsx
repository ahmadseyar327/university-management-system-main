import { Ionicons } from "@expo/vector-icons";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { instructorEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import LoadingView from "../components/LoadingView";
import SlideOverDetail from "../components/SlideOverDetail";
import type { AdminTabParamList } from "../navigation/types";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Row = Record<string, unknown>;

type Props = DrawerScreenProps<AdminTabParamList, "AdminInstructors">;

function displayName(item: Row) {
  return `${String(item.fname ?? "").trim()} ${String(item.lname ?? "").trim()}`.trim() || "—";
}

export default function AdminInstructorsListScreen(_props: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<Row | null>(null);
  const firstFocus = useRef(true);

  const load = useCallback(async () => {
    const res = await fetchResponse(instructorEndpoints.getInstructors(), 0, null);
    if (!res?.success) {
      toastError(res?.message ?? "Could not load instructors");
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
  }, []);

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

  function confirmDelete(item: Row) {
    const id = mongoId(item);
    Alert.alert("Delete instructor", `Remove ${displayName(item)}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const res = await fetchResponse(instructorEndpoints.deleteSingleInstructor(id), 3, null);
          if (!res?.success) toastError(res?.message ?? "Delete failed");
          else {
            toastSuccess(res.message ?? "Deleted");
            setRows((r) => r.filter((x) => mongoId(x) !== id));
            setDetail((d) => (d && mongoId(d) === id ? null : d));
          }
        },
      },
    ]);
  }

  if (loading && rows.length === 0) return <LoadingView />;

  return (
    <View style={styles.screen}>
      <FlatList
        data={rows}
        keyExtractor={(item) => mongoId(item)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No instructors yet.</Text>}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => setDetail(item)}
            android_ripple={{ color: "#e2e8f0" }}
          >
            <Text style={styles.rowName} numberOfLines={1}>
              {displayName(item)}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </Pressable>
        )}
      />

      <SlideOverDetail open={detail !== null} onClosed={() => setDetail(null)}>
        {detail ? (
          <>
            <Text style={styles.detailEyebrow}>Instructor</Text>
            <Text style={styles.detailTitle}>{displayName(detail)}</Text>
            <View style={styles.detailCard}>
              <Text style={styles.k}>Email</Text>
              <Text style={styles.v}>{String(detail.email ?? "—")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Added</Text>
              <Text style={styles.v}>{String(detail.createdAt ?? "—")}</Text>
            </View>
            <Pressable style={styles.dangerBtn} onPress={() => confirmDelete(detail)}>
              <Text style={styles.dangerTxt}>Delete instructor</Text>
            </Pressable>
          </>
        ) : null}
      </SlideOverDetail>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1f5f9" },
  list: { paddingVertical: 8, paddingBottom: 40 },
  empty: { textAlign: "center", color: "#64748b", marginTop: 48, fontSize: 15 },
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
    marginBottom: 20,
  },
  k: { fontSize: 12, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 },
  v: { fontSize: 16, fontWeight: "600", color: "#0f172a", marginBottom: 14 },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 4 },
  dangerBtn: {
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  dangerTxt: { color: "#b91c1c", fontWeight: "700", fontSize: 16 },
});
