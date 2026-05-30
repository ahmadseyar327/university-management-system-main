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
import { EmptyState, ScreenContainer, ScreenHeader } from "../components";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { InstructorTabParamList } from "../navigation/types";
import { colors, radius, shadow, spacing } from "../theme";
import { listStyles } from "../theme/listStyles";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type OfferedRow = Record<string, unknown> & {
  status?: string;
  requestId?: string;
};

type Props = DrawerScreenProps<InstructorTabParamList, "InstructorCourses">;

function titleOf(row: OfferedRow) {
  return String(row.title ?? "Untitled course");
}

export default function InstructorCoursesScreen(_props: Props) {
  const { instructorData } = useAuth();
  const instructorId = mongoId(instructorData);
  const [courses, setCourses] = useState<OfferedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState("");
  const firstFocus = useRef(true);

  const load = useCallback(async () => {
    const res = await fetchResponse(
      courseEndpoints.getCoursesOfInstructor(instructorId),
      0,
      null
    );
    if (res?.success) {
      setCourses((res.data as OfferedRow[]) ?? []);
    } else {
      toastError(res?.message ?? "Could not load courses");
      setCourses([]);
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

  const pending = useMemo(
    () => courses.filter((c) => String(c.status).toLowerCase() === "pending"),
    [courses]
  );

  const active = useMemo(
    () =>
      courses
        .filter((c) => String(c.status).toLowerCase() === "approved")
        .sort((a, b) => titleOf(a).localeCompare(titleOf(b))),
    [courses]
  );

  async function review(offerId: string, action: "approve" | "decline") {
    setBusyId(offerId);
    const res = await fetchResponse(courseEndpoints.instructorReviewOffer(offerId), 2, {
      instructorId,
      action,
    });
    setBusyId("");
    if (!res?.success) {
      toastError(res?.message ?? "Could not update offer");
      return;
    }
    toastSuccess(res.message ?? (action === "approve" ? "Accepted" : "Declined"));
    await load();
  }

  if (loading && courses.length === 0) return <LoadingView />;

  return (
    <ScreenContainer>
      <ScreenHeader
        title="My courses"
        subtitle="Accept admin offers, then view your active teaching assignments."
      />

      {pending.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course offers</Text>
          {pending.map((item) => {
            const id = String(item.requestId ?? "");
            return (
              <View key={id} style={[styles.offerCard, shadow.soft]}>
                <Text style={styles.offerTitle}>{titleOf(item)}</Text>
                <Text style={styles.offerSub}>
                  {String(item.code ?? "")} · {String(item.creditHours ?? "")} credits
                </Text>
                <View style={styles.offerActions}>
                  <Pressable
                    style={[styles.declineBtn, busyId === id && styles.btnDisabled]}
                    disabled={busyId === id}
                    onPress={() => void review(id, "decline")}
                  >
                    <Text style={styles.declineTxt}>Decline</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.acceptBtn, busyId === id && styles.btnDisabled]}
                    disabled={busyId === id}
                    onPress={() => void review(id, "approve")}
                  >
                    {busyId === id ? (
                      <ActivityIndicator color={colors.textInverse} />
                    ) : (
                      <Text style={styles.acceptTxt}>Accept</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Active courses</Text>
      <FlatList
        data={active}
        keyExtractor={(item, i) => mongoId(item) || String(i)}
        scrollEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.instructor}
            colors={[colors.instructor]}
          />
        }
        contentContainerStyle={listStyles.list}
        ListEmptyComponent={
          <EmptyState
            icon="library-outline"
            title="No active courses yet."
            message={
              pending.length
                ? "Accept a course offer above to get started."
                : "An administrator will send you course offers."
            }
          />
        }
        ItemSeparatorComponent={() => <View style={listStyles.sep} />}
        renderItem={({ item }) => (
          <View style={listStyles.row}>
            <View style={{ flex: 1 }}>
              <Text style={listStyles.rowName}>{titleOf(item)}</Text>
              <Text style={styles.codeTag}>{String(item.code ?? "")}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color={colors.instructor} />
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  offerCard: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning,
    marginBottom: spacing.sm,
  },
  offerTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  offerSub: { marginTop: 4, fontSize: 13, color: colors.textSecondary },
  offerActions: { flexDirection: "row", gap: 10, marginTop: spacing.md },
  declineBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.instructor,
    alignItems: "center",
  },
  declineTxt: { color: colors.danger, fontWeight: "700" },
  acceptTxt: { color: colors.textInverse, fontWeight: "700" },
  btnDisabled: { opacity: 0.6 },
  codeTag: { marginTop: 4, color: colors.instructor, fontSize: 12, fontWeight: "600" },
});
