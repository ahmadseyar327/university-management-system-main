import { Ionicons } from "@expo/vector-icons";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { instructorEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { EmptyState, SlideOverDetail } from "../components";
import LoadingView from "../components/LoadingView";
import type { AdminTabParamList } from "../navigation/types";
import { colors, radius } from "../theme";
import { listStyles } from "../theme/listStyles";
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
    <View style={listStyles.screen}>
      <FlatList
        data={rows}
        keyExtractor={(item) => mongoId(item)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
        contentContainerStyle={listStyles.listFlush}
        ListEmptyComponent={
          <View style={listStyles.emptyWrap}>
            <EmptyState icon="people-outline" title="No instructors yet." />
          </View>
        }
        ItemSeparatorComponent={() => <View style={listStyles.sep} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [listStyles.row, pressed && listStyles.rowPressed]}
            onPress={() => setDetail(item)}
            android_ripple={{ color: colors.border }}
          >
            <Text style={listStyles.rowName} numberOfLines={1}>
              {displayName(item)}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>
        )}
      />

      <SlideOverDetail open={detail !== null} onClosed={() => setDetail(null)}>
        {detail ? (
          <>
            <Text style={listStyles.detailEyebrow}>Instructor</Text>
            <Text style={listStyles.detailTitle}>{displayName(detail)}</Text>
            <View style={listStyles.detailCard}>
              <Text style={listStyles.k}>Email</Text>
              <Text style={listStyles.v}>{String(detail.email ?? "—")}</Text>
              <View style={listStyles.divider} />
              <Text style={listStyles.k}>Added</Text>
              <Text style={listStyles.v}>{String(detail.createdAt ?? "—")}</Text>
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
  dangerBtn: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.danger,
  },
  dangerTxt: { color: colors.danger, fontWeight: "700", fontSize: 16 },
});
