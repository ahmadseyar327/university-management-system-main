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
import LoadingView from "../components/LoadingView";
import SlideOverDetail from "../components/SlideOverDetail";
import { useAuth } from "../contexts/AuthContext";
import type { InstructorTabParamList } from "../navigation/types";
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
    <View style={styles.screen}>
      <FlatList
        data={listRows}
        keyExtractor={(item, i) => mongoId(item) || String(i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.header}>Courses catalog</Text>}
        ListEmptyComponent={<Text style={styles.empty}>No courses found.</Text>}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => setDetail(item)}
            android_ripple={{ color: "#e2e8f0" }}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.rowName} numberOfLines={1}>
                {titleOf(item)}
              </Text>
              {item.__status === "approved" ? (
                <Text style={styles.approvedTag}>Assigned to you</Text>
              ) : item.__status === "pending" ? (
                <Text style={styles.pendingTag}>Pending admin approval</Text>
              ) : null}
            </View>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        )}
      />

      <SlideOverDetail open={detail !== null} onClosed={() => setDetail(null)}>
        {detail ? (
          <>
            <Text style={styles.detailEyebrow}>Course</Text>
            <Text style={styles.detailTitle}>{titleOf(detail)}</Text>
            <View style={styles.detailCard}>
              <Text style={styles.k}>Code</Text>
              <Text style={styles.v}>{String(detail.code ?? "—")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Type</Text>
              <Text style={styles.v}>{String(detail.type ?? "—")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Credit hours</Text>
              <Text style={styles.v}>{String(detail.creditHours ?? "—")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Fee</Text>
              <Text style={styles.v}>{String(detail.fee ?? "—")}</Text>
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
                  <ActivityIndicator color="#fff" />
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
  screen: { flex: 1, backgroundColor: "#f1f5f9" },
  list: { paddingVertical: 8, paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingBottom: 8, color: "#64748b", fontWeight: "700", fontSize: 14 },
  empty: { textAlign: "center", color: "#718096", marginTop: 28 },
  sep: { height: 1, backgroundColor: "#e2e8f0", marginLeft: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  rowPressed: { backgroundColor: "#f8fafc" },
  rowLeft: { flex: 1, marginRight: 10 },
  rowName: { fontSize: 17, fontWeight: "600", color: "#0f172a" },
  approvedTag: { marginTop: 6, color: "#047857", fontSize: 12, fontWeight: "700" },
  pendingTag: { marginTop: 6, color: "#92400e", fontSize: 12, fontWeight: "700" },
  chev: { color: "#94a3b8", fontSize: 24, lineHeight: 24 },
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
  primaryBtn: {
    backgroundColor: "#0f766e",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
  approvedBtn: {
    backgroundColor: "#ecfdf5",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#86efac",
  },
  approvedTxt: { color: "#047857", fontWeight: "700", fontSize: 16 },
  pendingBtn: {
    backgroundColor: "#fffbeb",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  pendingTxt: { color: "#92400e", fontWeight: "700", fontSize: 16 },
});
