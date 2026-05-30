import { Ionicons } from "@expo/vector-icons";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { courseEndpoints, instructorEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { EmptyState, ScreenContainer, ScreenHeader } from "../components";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { AdminTabParamList } from "../navigation/types";
import { colors, radius, shadow, spacing } from "../theme";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type OfferRow = Record<string, unknown>;
type Props = DrawerScreenProps<AdminTabParamList, "AdminOfferRequests">;

function initials(row: Record<string, unknown>) {
  return `${String(row.fname ?? "").charAt(0)}${String(row.lname ?? "").charAt(0)}`.toUpperCase();
}

export default function AdminOfferRequestsScreen(_props: Props) {
  const { adminData } = useAuth();
  const adminId = mongoId(adminData);
  const [instructors, setInstructors] = useState<Record<string, unknown>[]>([]);
  const [courses, setCourses] = useState<Record<string, unknown>[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [instructorId, setInstructorId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const firstFocus = useRef(true);

  const loadOffers = useCallback(async () => {
    const res = await fetchResponse(courseEndpoints.getCourseAssignments(), 0, null);
    setOffers(res?.success && res.data ? (res.data as OfferRow[]) : []);
  }, []);

  const load = useCallback(async () => {
    const [instRes, courseRes] = await Promise.all([
      fetchResponse(instructorEndpoints.getInstructors(), 0, null),
      fetchResponse(courseEndpoints.getCourses(), 0, null),
      loadOffers(),
    ]);
    if (instRes?.success) {
      const d = (instRes.data as Record<string, unknown>[]) ?? [];
      setInstructors(
        [...d].sort((a, b) =>
          `${a.fname} ${a.lname}`.localeCompare(`${b.fname} ${b.lname}`)
        )
      );
    }
    if (courseRes?.success) {
      const d = (courseRes.data as Record<string, unknown>[]) ?? [];
      setCourses([...d].sort((a, b) => String(a.title).localeCompare(String(b.title))));
    }
  }, [loadOffers]);

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

  const takenIds = useMemo(() => {
    if (!instructorId) return new Set<string>();
    return new Set(
      offers
        .filter(
          (o) =>
            o.instructorId === instructorId &&
            (o.status === "pending" || o.status === "approved")
        )
        .map((o) => String(o.courseId))
    );
  }, [offers, instructorId]);

  const available = useMemo(
    () => courses.filter((c) => !takenIds.has(mongoId(c))),
    [courses, takenIds]
  );

  const pending = useMemo(() => offers.filter((o) => o.status === "pending"), [offers]);
  const active = useMemo(() => offers.filter((o) => o.status === "approved"), [offers]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function sendOffer() {
    if (!instructorId || !courseId) {
      toastError("Select an instructor and a course.");
      return;
    }
    setSending(true);
    const res = await fetchResponse(courseEndpoints.assignCourseToInstructor(), 1, {
      adminId,
      instructorId,
      courseId,
    });
    setSending(false);
    if (!res?.success) {
      toastError(res?.message ?? "Could not send offer");
      return;
    }
    toastSuccess(res.message ?? "Offer sent");
    setCourseId("");
    await loadOffers();
  }

  async function cancelOffer(row: OfferRow) {
    const id = mongoId(row);
    if (!id) return;
    const res = await fetchResponse(courseEndpoints.deleteCourseAssignment(id), 3, null);
    if (!res?.success) {
      toastError(res?.message ?? "Could not remove");
      return;
    }
    toastSuccess(res.message ?? "Removed");
    await loadOffers();
  }

  if (loading && instructors.length === 0) return <LoadingView />;

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Offer courses"
        subtitle="Pick an instructor and course. They must accept before it is active."
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Text style={styles.step}>1. Instructor</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
          {instructors.map((inst) => {
            const id = mongoId(inst);
            const active = instructorId === id;
            return (
              <Pressable
                key={id}
                style={[styles.personChip, active && styles.personChipActive, shadow.soft]}
                onPress={() => {
                  setInstructorId(id);
                  setCourseId("");
                }}
              >
                <View style={[styles.avatar, active && styles.avatarActive]}>
                  <Text style={styles.avatarTxt}>{initials(inst)}</Text>
                </View>
                <Text style={styles.personName} numberOfLines={1}>
                  {String(inst.fname)} {String(inst.lname)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.step}>2. Course</Text>
        {!instructorId ? (
          <Text style={styles.hint}>Select an instructor first.</Text>
        ) : available.length === 0 ? (
          <Text style={styles.hint}>No more courses available for this instructor.</Text>
        ) : (
          <View style={styles.courseGrid}>
            {available.map((c) => {
              const id = mongoId(c);
              const selected = courseId === id;
              return (
                <Pressable
                  key={id}
                  style={[styles.courseChip, selected && styles.courseChipActive]}
                  onPress={() => setCourseId(id)}
                >
                  <Text style={styles.courseTitle} numberOfLines={2}>
                    {String(c.title)}
                  </Text>
                  <Text style={styles.courseCode}>{String(c.code)}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable
          style={[styles.sendBtn, (!instructorId || !courseId || sending) && styles.sendBtnDisabled]}
          disabled={!instructorId || !courseId || sending}
          onPress={() => void sendOffer()}
        >
          {sending ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.sendTxt}>Send offer</Text>
          )}
        </Pressable>

        <Text style={[styles.step, { marginTop: spacing.lg }]}>Pending ({pending.length})</Text>
        {pending.length === 0 ? (
          <Text style={styles.hint}>No offers awaiting instructor approval.</Text>
        ) : (
          pending.map((row) => (
            <View key={mongoId(row)} style={[styles.statusRow, shadow.soft]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>{String(row.courseTitle)}</Text>
                <Text style={styles.statusSub}>{String(row.instructorName)}</Text>
              </View>
              <Pressable onPress={() => void cancelOffer(row)}>
                <Text style={styles.cancelTxt}>Cancel</Text>
              </Pressable>
            </View>
          ))
        )}

        <Text style={[styles.step, { marginTop: spacing.md }]}>Active ({active.length})</Text>
        {active.length === 0 ? (
          <Text style={styles.hint}>No approved assignments yet.</Text>
        ) : (
          active.map((row) => (
            <View key={mongoId(row)} style={[styles.statusRow, shadow.soft]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>{String(row.courseTitle)}</Text>
                <Text style={styles.statusSub}>{String(row.instructorName)}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
            </View>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  step: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  hScroll: { marginBottom: spacing.md },
  personChip: {
    width: 100,
    alignItems: "center",
    padding: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  personChipActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  avatarActive: { backgroundColor: colors.primary },
  avatarTxt: { fontWeight: "700", color: colors.textInverse, fontSize: 13 },
  personName: { fontSize: 12, fontWeight: "600", color: colors.text, textAlign: "center" },
  hint: { color: colors.textSecondary, fontSize: 14, marginBottom: spacing.md },
  courseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  courseChip: {
    width: "47%",
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  courseChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  courseTitle: { fontWeight: "600", fontSize: 14, color: colors.text },
  courseCode: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendTxt: { color: colors.textInverse, fontWeight: "700", fontSize: 16 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  statusTitle: { fontWeight: "700", fontSize: 15, color: colors.text },
  statusSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  cancelTxt: { color: colors.danger, fontWeight: "700" },
});
