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
import { EmptyState, ScreenContainer, ScreenHeader, SlideOverDetail } from "../components";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { AdminTabParamList } from "../navigation/types";
import { colors, radius, shadow, spacing } from "../theme";
import { listStyles } from "../theme/listStyles";
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
    <ScreenContainer scroll={false} contentContainerStyle={styles.container}>
      <ScreenHeader
        title="Offer requests"
        subtitle="Review instructor requests to teach courses."
      />
      <FlatList
        data={rows}
        keyExtractor={(item, i) => mongoId(item) || String(i)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="mail-outline" title="No pending requests." message="All offer requests have been reviewed." />
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, shadow.soft, pressed && styles.cardPressed]}
            onPress={() => setDetail(item)}
            android_ripple={{ color: colors.border }}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardName} numberOfLines={1}>
                {String(item.instructorName ?? "Unknown instructor")}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </View>
            <Text style={styles.cardSub} numberOfLines={1}>
              wants {String(item.courseTitle ?? "a course")}
            </Text>
            <View style={styles.cardMeta}>
              <Text style={styles.metaLabel}>Course code</Text>
              <Text style={styles.metaValue}>{String(item.courseCode ?? "—")}</Text>
            </View>
          </Pressable>
        )}
      />

      <SlideOverDetail open={detail !== null} onClosed={() => setDetail(null)}>
        {detail ? (
          <>
            <Text style={listStyles.detailEyebrow}>Offer request</Text>
            <Text style={listStyles.detailTitle}>{String(detail.instructorName ?? "Instructor")}</Text>
            <View style={listStyles.detailCard}>
              <Text style={listStyles.k}>Course</Text>
              <Text style={listStyles.v}>{String(detail.courseTitle ?? "—")}</Text>
              <View style={listStyles.divider} />
              <Text style={listStyles.k}>Course code</Text>
              <Text style={listStyles.v}>{String(detail.courseCode ?? "—")}</Text>
              <View style={listStyles.divider} />
              <Text style={listStyles.k}>Instructor email</Text>
              <Text style={listStyles.v}>{String(detail.instructorEmail ?? "—")}</Text>
              <View style={listStyles.divider} />
              <Text style={listStyles.k}>Requested at</Text>
              <Text style={listStyles.v}>{String(detail.createdAt ?? "—")}</Text>
            </View>
            <View style={styles.btnRow}>
              <Pressable
                style={[styles.btn, styles.declineBtn]}
                disabled={busyId === mongoId(detail)}
                onPress={() => void review("decline", detail)}
              >
                {busyId === mongoId(detail) ? (
                  <ActivityIndicator color={colors.danger} />
                ) : (
                  <Text style={styles.declineTxt}>Decline</Text>
                )}
              </Pressable>
              <Pressable
                style={[styles.btn, styles.approveBtn]}
                disabled={busyId === mongoId(detail)}
                onPress={() => void review("approve", detail)}
              >
                {busyId === mongoId(detail) ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={styles.approveTxt}>Approve</Text>
                )}
              </Pressable>
            </View>
          </>
        ) : null}
      </SlideOverDetail>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 0 },
  list: { paddingBottom: 40, gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  cardPressed: { backgroundColor: colors.primarySoft },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardName: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.text, marginRight: 8 },
  cardSub: { marginTop: 4, color: colors.textSecondary, fontSize: 13 },
  cardMeta: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: { fontSize: 14, fontWeight: "600", color: colors.text, marginTop: 2 },
  btnRow: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, borderRadius: radius.sm, paddingVertical: 13, alignItems: "center", justifyContent: "center" },
  declineBtn: { backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger },
  approveBtn: { backgroundColor: colors.primary },
  declineTxt: { color: colors.danger, fontWeight: "700", fontSize: 15 },
  approveTxt: { color: colors.textInverse, fontWeight: "700", fontSize: 15 },
});
