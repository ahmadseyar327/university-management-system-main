import { Ionicons } from "@expo/vector-icons";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
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
import type { AdminTabParamList } from "../navigation/types";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type ReqRow = Record<string, unknown>;
type Props = DrawerScreenProps<AdminTabParamList, "AdminOfferRequests">;

export default function AdminOfferRequestsScreen(_props: Props) {
  const { adminData } = useAuth();
  const adminId = mongoId(adminData);
  const [rows, setRows] = useState<ReqRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [detail, setDetail] = useState<ReqRow | null>(null);
  const firstFocus = useRef(true);

  const load = useCallback(async () => {
    const res = await fetchResponse(courseEndpoints.getOfferRequests(), 0, null);
    if (!res?.success) {
      setRows([]);
      return;
    }
    const data = (res.data as ReqRow[]) ?? [];
    setRows(
      [...data].sort(
        (a, b) =>
          new Date(String(b.createdAt ?? "")).getTime() -
          new Date(String(a.createdAt ?? "")).getTime()
      )
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

  async function review(action: "approve" | "decline", row: ReqRow) {
    const id = mongoId(row);
    if (!id || !adminId) {
      toastError("Missing request or admin id.");
      return;
    }
    setBusyId(id);
    const res = await fetchResponse(courseEndpoints.reviewOfferRequest(id), 2, {
      adminId,
      action,
    });
    setBusyId("");

    if (!res?.success) {
      toastError(res?.message ?? "Could not review request");
      return;
    }
    toastSuccess(res.message ?? (action === "approve" ? "Approved" : "Declined"));
    setRows((prev) => prev.filter((x) => mongoId(x) !== id));
    setDetail((d) => (d && mongoId(d) === id ? null : d));
  }

  if (loading && rows.length === 0) return <LoadingView />;

  return (
    <View style={styles.screen}>
      <FlatList
        data={rows}
        keyExtractor={(item, i) => mongoId(item) || String(i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.header}>Pending instructor requests</Text>}
        ListEmptyComponent={<Text style={styles.empty}>No pending requests.</Text>}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => setDetail(item)}
            android_ripple={{ color: "#e2e8f0" }}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.rowName} numberOfLines={1}>
                {String(item.instructorName ?? "Unknown instructor")}
              </Text>
              <Text style={styles.rowSub} numberOfLines={1}>
                wants {String(item.courseTitle ?? "a course")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </Pressable>
        )}
      />

      <SlideOverDetail open={detail !== null} onClosed={() => setDetail(null)}>
        {detail ? (
          <>
            <Text style={styles.detailEyebrow}>Offer request</Text>
            <Text style={styles.detailTitle}>{String(detail.instructorName ?? "Instructor")}</Text>
            <View style={styles.detailCard}>
              <Text style={styles.k}>Course</Text>
              <Text style={styles.v}>{String(detail.courseTitle ?? "—")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Course code</Text>
              <Text style={styles.v}>{String(detail.courseCode ?? "—")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Instructor email</Text>
              <Text style={styles.v}>{String(detail.instructorEmail ?? "—")}</Text>
              <View style={styles.divider} />
              <Text style={styles.k}>Requested at</Text>
              <Text style={styles.v}>{String(detail.createdAt ?? "—")}</Text>
            </View>
            <View style={styles.btnRow}>
              <Pressable
                style={[styles.btn, styles.declineBtn]}
                disabled={busyId === mongoId(detail)}
                onPress={() => void review("decline", detail)}
              >
                {busyId === mongoId(detail) ? <ActivityIndicator color="#b91c1c" /> : <Text style={styles.declineTxt}>Decline</Text>}
              </Pressable>
              <Pressable
                style={[styles.btn, styles.approveBtn]}
                disabled={busyId === mongoId(detail)}
                onPress={() => void review("approve", detail)}
              >
                {busyId === mongoId(detail) ? <ActivityIndicator color="#fff" /> : <Text style={styles.approveTxt}>Approve</Text>}
              </Pressable>
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
  rowSub: { marginTop: 4, color: "#64748b", fontSize: 13 },
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
    marginBottom: 18,
  },
  k: { fontSize: 12, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 },
  v: { fontSize: 16, fontWeight: "600", color: "#0f172a", marginBottom: 14 },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 4 },
  btnRow: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center", justifyContent: "center" },
  declineBtn: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" },
  approveBtn: { backgroundColor: "#1d4ed8" },
  declineTxt: { color: "#b91c1c", fontWeight: "700", fontSize: 15 },
  approveTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
