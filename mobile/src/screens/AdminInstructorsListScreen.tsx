import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { instructorEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import LoadingView from "../components/LoadingView";
import type { AdminTabParamList } from "../navigation/types";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Row = Record<string, unknown>;

type Props = BottomTabScreenProps<AdminTabParamList, "AdminInstructors">;

export default function AdminInstructorsListScreen(_props: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  function confirmDelete(item: Row) {
    const id = mongoId(item);
    Alert.alert("Delete instructor", `Remove ${String(item.fname)} ${String(item.lname)}?`, [
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
          }
        },
      },
    ]);
  }

  if (loading) return <LoadingView />;

  return (
    <FlatList
      data={rows}
      keyExtractor={(item) => mongoId(item)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No instructors.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>
            {String(item.fname)} {String(item.lname)}
          </Text>
          <Text style={styles.meta}>{String(item.email)}</Text>
          <Text style={styles.date}>{String(item.createdAt ?? "")}</Text>
          <Pressable style={styles.del} onPress={() => confirmDelete(item)}>
            <Text style={styles.delText}>Delete</Text>
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 40, backgroundColor: "#f7fafc" },
  empty: { textAlign: "center", color: "#718096", marginTop: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  name: { fontSize: 17, fontWeight: "700", color: "#1a202c" },
  meta: { color: "#4a5568", marginTop: 4 },
  date: { color: "#a0aec0", fontSize: 12, marginTop: 4 },
  del: { marginTop: 10, alignSelf: "flex-start" },
  delText: { color: "#c53030", fontWeight: "700" },
});
