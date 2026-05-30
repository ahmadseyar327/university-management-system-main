import { Ionicons } from "@expo/vector-icons";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { courseEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { EmptyState, SlideOverDetail } from "../components";
import LoadingView from "../components/LoadingView";
import type { AdminTabParamList } from "../navigation/types";
import { colors, radius } from "../theme";
import { listStyles } from "../theme/listStyles";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Row = Record<string, unknown>;

type Props = DrawerScreenProps<AdminTabParamList, "AdminCourses">;

export default function AdminCoursesListScreen(_props: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<Row | null>(null);
  const firstFocus = useRef(true);

  const load = useCallback(async () => {
    const res = await fetchResponse(courseEndpoints.getCourses(), 0, null);
    if (!res?.success) {
      toastError(res?.message ?? "Could not load courses");
      setRows([]);
      return;
    }
    const data = (res.data as Row[]) ?? [];
    setRows([...data].sort((a, b) => String(a.title).localeCompare(String(b.title))));
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
    Alert.alert("Delete course", `Remove ${String(item.title)}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const res = await fetchResponse(courseEndpoints.deleteSingleCourse(id), 3, null);
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
            <EmptyState icon="book-outline" title="No courses yet." />
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
              {String(item.title ?? "—")}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>
        )}
      />

      <SlideOverDetail open={detail !== null} onClosed={() => setDetail(null)}>
        {detail ? (
          <>
            <Text style={listStyles.detailEyebrow}>Course</Text>
            <Text style={listStyles.detailTitle}>{String(detail.title ?? "—")}</Text>
            <View style={listStyles.detailCard}>
              <Text style={listStyles.k}>Code</Text>
              <Text style={listStyles.v}>{String(detail.code ?? "—")}</Text>
              <View style={listStyles.divider} />
              <Text style={listStyles.k}>Type</Text>
              <Text style={listStyles.v}>{String(detail.type ?? "—")}</Text>
              <View style={listStyles.divider} />
              <Text style={listStyles.k}>Credit hours</Text>
              <Text style={listStyles.v}>{String(detail.creditHours ?? "—")}</Text>
              <View style={listStyles.divider} />
              <Text style={listStyles.k}>Fee</Text>
              <Text style={listStyles.v}>{String(detail.fee ?? "—")}</Text>
              <View style={listStyles.divider} />
              <Text style={listStyles.k}>Created</Text>
              <Text style={listStyles.v}>{String(detail.createdAt ?? "—")}</Text>
            </View>
            <Pressable style={styles.dangerBtn} onPress={() => confirmDelete(detail)}>
              <Text style={styles.dangerTxt}>Delete course</Text>
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
