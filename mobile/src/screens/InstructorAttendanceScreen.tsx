import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { courseEndpoints, instructorEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { FormTextInput, PrimaryButton } from "../components";
import SimpleSelect, { SelectOption } from "../components/SimpleSelect";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { InstructorTabParamList } from "../navigation/types";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Stud = Record<string, unknown> & {
  _id?: string;
  courseId?: string;
  courseTitle?: string;
  fname?: string;
  lname?: string;
  rollNumber?: unknown;
};

type AttRow = Record<string, unknown> & {
  studentId?: string;
  status?: string;
  _id?: string;
  name?: string;
};

type AttDoc = Record<string, unknown> & {
  _id?: string;
  date?: string;
  courseId?: string;
  attendance?: AttRow[];
};

type Props = DrawerScreenProps<InstructorTabParamList, "InstructorAttendance">;

/** Server allows max 3 chars per status. */
const STATUS = {
  P: { label: "Present", abbr: "P", color: "#059669", soft: "#d1fae5" },
  A: { label: "Absent", abbr: "A", color: "#dc2626", soft: "#fee2e2" },
  L: { label: "Late", abbr: "L", color: "#d97706", soft: "#ffedd5" },
  NA: { label: "N/A", abbr: "—", color: "#64748b", soft: "#e2e8f0" },
} as const;

type StatusKey = keyof typeof STATUS;

function normalizeStatus(raw: string): StatusKey {
  const s = raw.trim().toUpperCase();
  if (!s || s === "NA" || s === "N/A" || s === "N.A") return "NA";
  if (s === "P" || s === "PRESENT") return "P";
  if (s === "A" || s === "ABSENT") return "A";
  if (s === "L" || s === "LATE") return "L";
  const short = s.slice(0, 3);
  if (short === "N/A") return "NA";
  return "NA";
}

function statusToApi(k: StatusKey): string {
  return k;
}

function pulse(anim: Animated.Value) {
  Animated.sequence([
    Animated.timing(anim, { toValue: 0.96, duration: 70, useNativeDriver: true }),
    Animated.spring(anim, { toValue: 1, friction: 5, tension: 220, useNativeDriver: true }),
  ]).start();
}

function AttendanceRow({
  item,
  index,
  onStatus,
}: {
  item: AttRow;
  index: number;
  onStatus: (index: number, key: StatusKey) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const key = normalizeStatus(String(item.status ?? "NA"));
  const initials = String(item.name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: STATUS[key].soft }]}>
          <Text style={[styles.avatarTxt, { color: STATUS[key].color }]}>{initials || "?"}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.studentName}>{String(item.name ?? "")}</Text>
          <Text style={styles.rollLine}>Roll {String(item.rollNumber ?? "—")}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: STATUS[key].soft, borderColor: STATUS[key].color }]}>
          <Text style={[styles.statusPillTxt, { color: STATUS[key].color }]}>{STATUS[key].abbr}</Text>
        </View>
      </View>
      <View style={styles.chipRow}>
        {(Object.keys(STATUS) as StatusKey[]).map((k) => {
          const active = k === key;
          const meta = STATUS[k];
          return (
            <Pressable
              key={k}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                pulse(scale);
                onStatus(index, k);
              }}
              style={({ pressed }) => [
                styles.chip,
                { borderColor: meta.color, backgroundColor: active ? meta.soft : "#fff" },
                pressed && styles.chipPressed,
                active && { backgroundColor: meta.soft },
              ]}
            >
              <Text style={[styles.chipLabel, { color: active ? meta.color : "#64748b" }]}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

export default function InstructorAttendanceScreen(_props: Props) {
  const { instructorData } = useAuth();
  const instructorId = mongoId(instructorData);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [courseId, setCourseId] = useState("");
  const [students, setStudents] = useState<Stud[]>([]);
  const [doc, setDoc] = useState<AttDoc | null>(null);
  const [rows, setRows] = useState<AttRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const barAnim = useRef(new Animated.Value(0)).current;
  const [trackW, setTrackW] = useState(0);

  const loadStudents = useCallback(async () => {
    const res = await fetchResponse(courseEndpoints.getStudentsOfInstructor(instructorId), 0, null);
    if (!res?.success) {
      toastError(res?.message ?? "Could not load students");
      setStudents([]);
      return;
    }
    const data = (res.data as Stud[]) ?? [];
    setStudents(
      [...data].sort((a, b) => {
        const fn = String(a.fname).localeCompare(String(b.fname));
        return fn !== 0 ? fn : String(a.lname).localeCompare(String(b.lname));
      })
    );
  }, [instructorId]);

  useEffect(() => {
    let c = false;
    (async () => {
      setLoading(true);
      await loadStudents();
      if (!c) setLoading(false);
    })();
    return () => {
      c = true;
    };
  }, [loadStudents]);

  const courseOptions: SelectOption[] = useMemo(() => {
    const seen = new Set<string>();
    return students
      .filter((s) => {
        const id = String(s.courseId ?? "");
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .sort((a, b) => String(a.courseTitle).localeCompare(String(b.courseTitle)))
      .map((s) => ({ label: String(s.courseTitle ?? ""), value: String(s.courseId ?? "") }));
  }, [students]);

  const buildFreshRows = useCallback(
    (course: string, att: AttDoc | null) => {
      if (att?.attendance?.length) {
        return att.attendance.map((a) => {
          const st = normalizeStatus(String(a.status ?? "NA"));
          return {
            ...a,
            status: statusToApi(st),
            name: `${String(a.fname ?? "")} ${String(a.lname ?? "")}`.trim(),
          };
        });
      }
      return students
        .filter((s) => String(s.courseId) === course)
        .map((s) => ({
          studentId: mongoId(s),
          _id: mongoId(s),
          status: "NA",
          fname: s.fname,
          lname: s.lname,
          rollNumber: s.rollNumber,
          name: `${String(s.fname ?? "")} ${String(s.lname ?? "")}`.trim(),
        }));
    },
    [students]
  );

  const refreshAttendance = useCallback(async () => {
    if (!courseId || !date) return;
    const res = await fetchResponse(instructorEndpoints.getAttendances(instructorId, courseId, date), 0, null);
    const list = (res?.data as AttDoc[]) ?? [];
    const found =
      list.find((a) => String(a.courseId ?? "") === courseId) ?? (list.length ? list[0] : null);
    setDoc(found);
    setRows(buildFreshRows(courseId, found));
  }, [courseId, date, instructorId, buildFreshRows]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!courseId || !date) {
        setDoc(null);
        setRows([]);
        return;
      }
      const res = await fetchResponse(
        instructorEndpoints.getAttendances(instructorId, courseId, date),
        0,
        null
      );
      if (cancelled) return;
      const list = (res?.data as AttDoc[]) ?? [];
      const found =
        list.find((a) => String(a.courseId ?? "") === courseId) ?? (list.length ? list[0] : null);
      setDoc(found);
      setRows(buildFreshRows(courseId, found));
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, date, instructorId, students, buildFreshRows]);

  const counts = useMemo(() => {
    let p = 0,
      a = 0,
      l = 0,
      na = 0;
    for (const r of rows) {
      const k = normalizeStatus(String(r.status ?? "NA"));
      if (k === "P") p++;
      else if (k === "A") a++;
      else if (k === "L") l++;
      else na++;
    }
    return { p, a, l, na, total: rows.length };
  }, [rows]);

  useEffect(() => {
    const pct = counts.total ? counts.p / counts.total : 0;
    Animated.spring(barAnim, {
      toValue: trackW * pct,
      friction: 9,
      tension: 80,
      useNativeDriver: false,
    }).start();
  }, [counts.p, counts.total, trackW, barAnim]);

  function setRowStatus(index: number, key: StatusKey) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], status: statusToApi(key) };
      return next;
    });
  }

  function markAllPresent() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRows((prev) => prev.map((r) => ({ ...r, status: "P" })));
  }

  async function submit() {
    if (!courseId || !date) {
      toastError("Select course and date.");
      return;
    }
    const attendance = rows.map((r) => ({
      studentId: String(r.studentId ?? r._id ?? ""),
      status: String(r.status ?? "NA").slice(0, 3),
      isPublic: true,
    }));
    setSaving(true);
    try {
      if (doc?._id) {
        const res = await fetchResponse(instructorEndpoints.editAttendance(String(doc._id)), 2, {
          ...doc,
          date,
          attendance,
          instructorId,
          courseId,
        });
        if (!res?.success) {
          toastError(res?.message ?? "Update failed");
          return;
        }
        toastSuccess(res.message ?? "Attendance updated");
        await refreshAttendance();
      } else {
        const res = await fetchResponse(instructorEndpoints.postAttendance(), 1, {
          date,
          attendance,
          instructorId,
          courseId,
        });
        if (!res?.success) {
          toastError(res?.message ?? "Post failed");
          return;
        }
        toastSuccess(res.message ?? "Attendance saved");
        await refreshAttendance();
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingView />;

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Take attendance</Text>
        <Text style={styles.heroSub}>Tap a status for each student, then save. Progress animates as you go.</Text>
      </View>

      <View style={styles.panel}>
        <FormTextInput label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} autoCapitalize="none" />
        <SimpleSelect label="Course" options={courseOptions} value={courseId} onChange={setCourseId} />
        <View style={styles.modeBanner}>
          <Text style={styles.modeBannerTxt}>
            {doc?._id ? "Editing saved sheet for this date." : "New sheet — will be created on save."}
          </Text>
        </View>
      </View>

      {!!rows.length && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Today at a glance</Text>
          <View
            style={styles.track}
            onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}
          >
            <Animated.View style={[styles.trackFill, { width: barAnim, backgroundColor: "#10b981" }]} />
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryItem, { color: STATUS.P.color }]}>Present {counts.p}</Text>
            <Text style={[styles.summaryItem, { color: STATUS.A.color }]}>Absent {counts.a}</Text>
            <Text style={[styles.summaryItem, { color: STATUS.L.color }]}>Late {counts.l}</Text>
            <Text style={[styles.summaryItem, { color: STATUS.NA.color }]}>N/A {counts.na}</Text>
          </View>
          <Pressable style={styles.markAllBtn} onPress={markAllPresent}>
            <Text style={styles.markAllTxt}>Mark everyone present</Text>
          </Pressable>
        </View>
      )}

      {rows.map((item, index) => (
        <AttendanceRow key={String(item.studentId ?? item._id ?? index)} item={item} index={index} onStatus={setRowStatus} />
      ))}

      {!!courseId && !rows.length && (
        <Text style={styles.empty}>No students in this course, or load is still in progress.</Text>
      )}

      <PrimaryButton
        title={doc?._id ? "Save changes" : "Save attendance"}
        loading={saving}
        onPress={() => void submit()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#f1f5f9" },
  inner: { padding: 16, paddingBottom: 40 },
  hero: { marginBottom: 14 },
  heroTitle: { fontSize: 22, fontWeight: "800", color: "#0f172a", letterSpacing: -0.3 },
  heroSub: { marginTop: 6, fontSize: 14, color: "#64748b", lineHeight: 20 },
  panel: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modeBanner: {
    marginTop: 8,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  modeBannerTxt: { fontSize: 13, color: "#1e40af", fontWeight: "600" },
  summary: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  summaryTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a", marginBottom: 10 },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
    marginBottom: 10,
  },
  trackFill: { height: "100%", borderRadius: 999 },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 10 },
  summaryItem: { fontSize: 13, fontWeight: "700" },
  markAllBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#ecfdf5",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#6ee7b7",
  },
  markAllTxt: { color: "#047857", fontWeight: "700", fontSize: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarTxt: { fontWeight: "800", fontSize: 16 },
  cardMeta: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  rollLine: { fontSize: 13, color: "#64748b", marginTop: 2 },
  statusPill: {
    minWidth: 36,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
  },
  statusPillTxt: { fontWeight: "800", fontSize: 14 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
  },
  chipPressed: { opacity: 0.85 },
  chipLabel: { fontSize: 13, fontWeight: "700" },
  empty: { textAlign: "center", color: "#64748b", marginVertical: 20 },
});
