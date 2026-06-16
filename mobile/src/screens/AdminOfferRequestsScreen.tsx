import { Ionicons } from "@expo/vector-icons";
import type { DrawerScreenProps } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { courseEndpoints, instructorEndpoints, programEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { ScreenContainer, ScreenHeader, SimpleSelect } from "../components";
import type { SelectOption } from "../components/SimpleSelect";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { AdminTabParamList } from "../navigation/types";
import { colors, radius, shadow, spacing } from "../theme";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type OfferRow = Record<string, unknown>;
type Semester = { semesterNumber?: number; title?: string };
type Props = DrawerScreenProps<AdminTabParamList, "AdminOfferRequests">;

function initials(row: Record<string, unknown>) {
  return `${String(row.fname ?? "").charAt(0)}${String(row.lname ?? "").charAt(0)}`.toUpperCase();
}

export default function AdminOfferRequestsScreen(_props: Props) {
  const { adminData } = useAuth();
  const adminId = mongoId(adminData);
  const [programs, setPrograms] = useState<Record<string, unknown>[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [semesterCourses, setSemesterCourses] = useState<Record<string, unknown>[]>([]);
  const [instructors, setInstructors] = useState<Record<string, unknown>[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [programId, setProgramId] = useState("");
  const [semesterNumber, setSemesterNumber] = useState("1");
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

  const loadBase = useCallback(async () => {
    const [instRes, programRes] = await Promise.all([
      fetchResponse(instructorEndpoints.getInstructors(), 0, null),
      fetchResponse(programEndpoints.getPrograms(), 0, null),
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
    if (programRes?.success) {
      const d = (programRes.data as Record<string, unknown>[]) ?? [];
      setPrograms(d);
      if (d.length) setProgramId(String(d[0]._id ?? ""));
    }
  }, [loadOffers]);

  const loadSemesters = useCallback(async () => {
    if (!programId) return;
    const res = await fetchResponse(programEndpoints.getProgramById(programId), 0, null);
    if (res?.success && res.data) {
      const programData = res.data as Record<string, unknown>;
      const sems = (programData.semesters as Semester[]) ?? [];
      setSemesters(sems);
      if (sems.length) setSemesterNumber(String(sems[0].semesterNumber ?? 1));
    }
  }, [programId]);

  const loadSemesterCourses = useCallback(async () => {
    if (!programId || !semesterNumber) return;
    const res = await fetchResponse(
      programEndpoints.getSemesterCourses(programId, Number(semesterNumber)),
      0,
      null
    );
    if (res?.success && res.data) {
      const semesterData = res.data as Record<string, unknown>;
      setSemesterCourses((semesterData.courses as Record<string, unknown>[]) ?? []);
    } else {
      setSemesterCourses([]);
    }
    setCourseId("");
  }, [programId, semesterNumber]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        if (firstFocus.current) {
          setLoading(true);
          firstFocus.current = false;
        }
        await loadBase();
        if (!cancelled) setLoading(false);
      })();
      return () => {
        cancelled = true;
      };
    }, [loadBase])
  );

  useEffect(() => {
    void loadSemesters();
  }, [loadSemesters]);

  useEffect(() => {
    void loadSemesterCourses();
  }, [loadSemesterCourses]);

  const assignedIds = useMemo(
    () => new Set(offers.filter((o) => o.status === "approved").map((o) => String(o.courseId))),
    [offers]
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
    () =>
      semesterCourses.filter((c) => {
        const id = mongoId(c);
        return id && !assignedIds.has(id) && !takenIds.has(id);
      }),
    [semesterCourses, assignedIds, takenIds]
  );

  const pending = useMemo(() => offers.filter((o) => o.status === "pending"), [offers]);
  const active = useMemo(() => offers.filter((o) => o.status === "approved"), [offers]);

  const programOpts: SelectOption[] = programs.map((p) => ({
    label: String(p.name ?? "Program"),
    value: String(p._id ?? ""),
  }));

  const semesterOpts: SelectOption[] = semesters.map((s) => ({
    label: `Semester ${s.semesterNumber} — ${s.title ?? ""}`,
    value: String(s.semesterNumber ?? ""),
  }));

  async function onRefresh() {
    setRefreshing(true);
    await loadBase();
    await loadSemesters();
    await loadSemesterCourses();
    setRefreshing(false);
  }

  async function sendOffer() {
    if (!instructorId || !courseId) {
      toastError("Select an instructor and a semester course.");
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
        title="Offer semester courses"
        subtitle="Pick program, semester, instructor, then course."
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <SimpleSelect label="Program" options={programOpts} value={programId} onChange={setProgramId} />
        <SimpleSelect label="Semester" options={semesterOpts} value={semesterNumber} onChange={setSemesterNumber} />

        <Text style={styles.step}>1. Instructor</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
          {instructors.map((inst) => {
            const id = mongoId(inst);
            const activeChip = instructorId === id;
            return (
              <Pressable
                key={id}
                style={[styles.personChip, activeChip && styles.personChipActive, shadow.soft]}
                onPress={() => {
                  setInstructorId(id);
                  setCourseId("");
                }}
              >
                <View style={[styles.avatar, activeChip && styles.avatarActive]}>
                  <Text style={styles.avatarTxt}>{initials(inst)}</Text>
                </View>
                <Text style={styles.personName} numberOfLines={1}>
                  {String(inst.fname)} {String(inst.lname)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.step}>2. Semester course</Text>
        {!instructorId ? (
          <Text style={styles.hint}>Select an instructor first.</Text>
        ) : semesterCourses.length === 0 ? (
          <Text style={styles.hint}>No courses in this semester. Add them under Programs.</Text>
        ) : available.length === 0 ? (
          <Text style={styles.hint}>No available courses for this instructor in this semester.</Text>
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
                <Text style={styles.statusSub}>
                  {String(row.instructorName)}
                  {row.programName ? ` · ${row.programName} Sem ${row.semesterNumber}` : ""}
                </Text>
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
                <Text style={styles.statusSub}>
                  {String(row.instructorName)}
                  {row.programName ? ` · ${row.programName} Sem ${row.semesterNumber}` : ""}
                </Text>
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
    marginTop: spacing.sm,
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
