import { Ionicons } from "@expo/vector-icons";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { courseEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { EmptyState, SlideOverDetail } from "../components";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { InstructorTabParamList } from "../navigation/types";
import { colors, radius, roleThemes, spacing } from "../theme";
import { listStyles } from "../theme/listStyles";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Row = Record<string, unknown>;
type OfferedRow = Row & { status?: string; requestId?: string };

type Props = DrawerScreenProps<InstructorTabParamList, "InstructorCourses">;

function titleOf(row: Row) {
  return String(row.title ?? "Untitled course");
}

function statusOf(row: OfferedRow): "approved" | "pending" | "declined" {
  const s = String(row.status ?? "approved").toLowerCase();
  if (s === "pending" || s === "declined") return s;
  return "approved";
}

export default function InstructorCoursesScreen(_props: Props) {
  const { instructorData } = useAuth();
  const instructorId = mongoId(instructorData);
  const [offered, setOffered] = useState<OfferedRow[]>([]);
  const [catalog, setCatalog] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<Row | null>(null);
  const [requestingId, setRequestingId] = useState("");
  const firstFocus = useRef(true);

  const load = useCallback(async () => {
    const [r1, r2] = await Promise.all([
      fetchResponse(courseEndpoints.getCoursesOfInstructor(instructorId), 0, null),
      fetchResponse(courseEndpoints.getCourses(), 0, null),
    ]);
    if (r1?.success) {
      const d = (r1.data as OfferedRow[]) ?? [];
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

  const statusMap = useMemo(() => {
    const map = new Map<string, "approved" | "pending" | "declined">();
    for (const o of offered) {
      map.set(mongoId(o), statusOf(o));
    }
    return map;
  }, [offered]);

  async function requestOffer(item: Row) {
    const courseId = mongoId(item);
    const current = statusMap.get(courseId);
    if (current === "approved") {
      toastSuccess("You already teach this course.");
      return;
    }
    if (current === "pending") {
      toastSuccess("Request already pending admin approval.");
      return;
    }

    setRequestingId(courseId);
    const res = await fetchResponse(courseEndpoints.offerCourse(), 1, {
      instructorId,
      courseId,
    });
    setRequestingId("");

    if (!res?.success) {
      toastError(res?.message ?? "Could not send request");
      return;
    }
    toastSuccess(res.message ?? "Offer request sent to admin.");
    await load();
  }

  const listRows = useMemo(
    () =>
      catalog.map((c) => ({
        ...c,
        __status: statusMap.get(mongoId(c)) ?? null,
      })),
    [catalog, statusMap]
  );

  if (loading && catalog.length === 0) return <LoadingView />;

  return (
    <View style={listStyles.screen}>
      <FlatList
        data={listRows}
        keyExtractor={(item, i) => mongoId(item) || String(i)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.instructor} colors={[colors.instructor]} />
        }
        contentContainerStyle={listStyles.list}
        ListHeaderComponent={<Text style={styles.header}>Courses catalog</Text>}
        ListEmptyComponent={
          <View style={listStyles.emptyWrap}>
            <EmptyState icon="library-outline" title="No courses found." />
          </View>
        }
        ItemSeparatorComponent={() => <View style={listStyles.sep} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [listStyles.row, pressed && listStyles.rowPressed]}
            onPress={() => setDetail(item)}
            android_ripple={{ color: colors.border }}
          >
            <View style={styles.rowLeft}>
              <Text style={listStyles.rowName} numberOfLines={1}>
                {titleOf(item)}
              </Text>
              {item.__status === "approved" ? (
                <Text style={styles.approvedTag}>Assigned to you</Text>
              ) : item.__status === "pending" ? (
                <Text style={styles.pendingTag}>Pending admin approval</Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.instructor} />
          </Pressable>
        )}
      />

      <SlideOverDetail open={detail !== null} onClosed={() => setDetail(null)}>
        {detail ? (
          <>
            <Text style={listStyles.detailEyebrow}>Course</Text>
            <Text style={listStyles.detailTitle}>{titleOf(detail)}</Text>
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
            </View>
            {statusMap.get(mongoId(detail)) === "approved" ? (
              <View style={styles.approvedBtn}>
                <Text style={styles.approvedTxt}>Assigned to you</Text>
              </View>
            ) : statusMap.get(mongoId(detail)) === "pending" ? (
              <View style={styles.pendingBtn}>
                <Text style={styles.pendingTxt}>Request pending approval</Text>
              </View>
            ) : (
              <Pressable
                style={styles.primaryBtn}
                disabled={requestingId === mongoId(detail)}
                onPress={() => void requestOffer(detail)}
              >
                {requestingId === mongoId(detail) ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={styles.primaryTxt}>Request to teach this course</Text>
                )}
              </Pressable>
            )}
          </>
        ) : null}
      </SlideOverDetail>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: spacing.sm,
    color: colors.textSecondary,
    fontWeight: "700",
    fontSize: 14,
  },
  rowLeft: { flex: 1, marginRight: 10 },
  approvedTag: { marginTop: 6, color: colors.instructor, fontSize: 12, fontWeight: "700" },
  pendingTag: { marginTop: 6, color: colors.warning, fontSize: 12, fontWeight: "700" },
  primaryBtn: {
    backgroundColor: roleThemes.instructor.accent,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryTxt: { color: colors.textInverse, fontWeight: "700", fontSize: 16 },
  approvedBtn: {
    backgroundColor: roleThemes.instructor.accentSoft,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.instructor,
  },
  approvedTxt: { color: colors.instructor, fontWeight: "700", fontSize: 16 },
  pendingBtn: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.warning,
  },
  pendingTxt: { color: colors.warning, fontWeight: "700", fontSize: 16 },
});
