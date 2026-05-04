import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { courseEndpoints, instructorEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { FormTextInput, PrimaryButton } from "../components";
import SimpleSelect, { SelectOption } from "../components/SimpleSelect";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { InstructorTabParamList } from "../navigation/types";
import { examTypes } from "../utils/constants";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Stud = Record<string, unknown> & {
  _id?: string;
  courseId?: string;
  courseTitle?: string;
  fname?: string;
  lname?: string;
  rollNumber?: unknown;
};

type Props = DrawerScreenProps<InstructorTabParamList, "InstructorMarks">;

export default function InstructorMarksScreen(_props: Props) {
  const { instructorData } = useAuth();
  const instructorId = mongoId(instructorData);
  const [mode, setMode] = useState<"post" | "view">("post");
  const [students, setStudents] = useState<Stud[]>([]);
  const [course, setCourse] = useState("");
  const [examType, setExamType] = useState("");
  const [activityNumber, setActivityNumber] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [weightage, setWeightage] = useState("");
  const [marksRows, setMarksRows] = useState<Stud[]>([]);
  const [academic, setAcademic] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const examOpts: SelectOption[] = examTypes.map((e) => ({ label: e, value: e }));

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

  const courseOpts: SelectOption[] = (() => {
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
  })();

  useEffect(() => {
    const filtered = students
      .filter((s) => String(s.courseId) === course)
      .map((s) => ({
        ...s,
        name: `${String(s.fname ?? "")} ${String(s.lname ?? "")}`.trim(),
        obtainedMarks: 0,
      }));
    setMarksRows(filtered);
  }, [course, students]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (mode !== "view" || !course || !examType || !activityNumber) {
        setAcademic(null);
        return;
      }
      const res = await fetchResponse(
        instructorEndpoints.getAcademics(instructorId, course, examType, activityNumber),
        0,
        null
      );
      if (cancelled) return;
      if (!res?.success) {
        setAcademic(null);
        return;
      }
      const data = res.data as Record<string, unknown> | null;
      if (data?.marks && Array.isArray(data.marks)) {
        data.marks = (data.marks as Record<string, unknown>[]).map((m) => ({
          ...m,
          name: `${String(m.fname ?? "")} ${String(m.lname ?? "")}`.trim(),
        }));
      }
      setAcademic(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, course, examType, activityNumber, instructorId]);

  async function postMarks() {
    if (!course || !examType || !activityNumber || !totalMarks || !weightage) {
      toastError("Fill course, exam type, activity #, total marks, and weightage.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetchResponse(instructorEndpoints.postAcademics(), 1, {
        examType,
        totalMarks: parseFloat(totalMarks),
        activityNumber,
        weightage,
        marks: marksRows.map((m) => ({
          studentId: mongoId(m),
          obtainedMarks: parseFloat(String(m.obtainedMarks ?? "0")) || 0,
          isPublic: true,
        })),
        instructorId,
        courseId: course,
      });
      if (!res?.success) toastError(res?.message ?? "Post failed");
      else toastSuccess(res.message ?? "Posted");
    } finally {
      setBusy(false);
    }
  }

  const viewMarks = (academic?.marks as Record<string, unknown>[]) ?? [];

  async function updateMarks() {
    if (!academic?._id) {
      toastError("Load marks first (view tab + selections).");
      return;
    }
    setBusy(true);
    try {
      const res = await fetchResponse(instructorEndpoints.editAcademics(String(academic._id)), 2, {
        ...academic,
        marks: viewMarks,
      });
      if (!res?.success) toastError(res?.message ?? "Update failed");
      else toastSuccess(res.message ?? "Updated");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingView />;

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Marks</Text>
        <Text style={styles.heroSub}>Post new marks or load and update an existing activity.</Text>
      </View>
      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeBtn, mode === "post" && styles.modeOn, { marginRight: 6 }]}
          onPress={() => setMode("post")}
        >
          <Text style={[styles.modeTxt, mode === "post" && styles.modeTxtOn]}>Post marks</Text>
        </Pressable>
        <Pressable style={[styles.modeBtn, mode === "view" && styles.modeOn]} onPress={() => setMode("view")}>
          <Text style={[styles.modeTxt, mode === "view" && styles.modeTxtOn]}>View / update</Text>
        </Pressable>
      </View>
      <View style={styles.panel}>
        <SimpleSelect label="Course" options={courseOpts} value={course} onChange={setCourse} />
        <SimpleSelect label="Exam type" options={examOpts} value={examType} onChange={setExamType} />
        <FormTextInput label="Activity number" value={activityNumber} onChangeText={setActivityNumber} keyboardType="numeric" />
      </View>
      {mode === "post" && (
        <>
          <FormTextInput label="Total marks" value={totalMarks} onChangeText={setTotalMarks} keyboardType="decimal-pad" />
          <FormTextInput label="Weightage" value={weightage} onChangeText={setWeightage} keyboardType="decimal-pad" />
          {marksRows.map((m, i) => (
            <View key={mongoId(m)} style={styles.markCard}>
              <Text style={styles.roll}>{String(m.rollNumber ?? "")}</Text>
              <Text style={styles.nm}>{String(m.name)}</Text>
              <TextInput
                style={styles.markIn}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#94a3b8"
                value={String(m.obtainedMarks ?? "")}
                onChangeText={(t) => {
                  const next = [...marksRows];
                  next[i] = { ...next[i], obtainedMarks: t as unknown as number };
                  setMarksRows(next);
                }}
              />
            </View>
          ))}
          <PrimaryButton title="Post marks" loading={busy} onPress={() => void postMarks()} />
        </>
      )}
      {mode === "view" && (
        <>
          <Text style={styles.hint}>Enter activity # — marks load automatically when set.</Text>
          <FormTextInput
            label="Total marks (edit)"
            value={String(academic?.totalMarks ?? "")}
            onChangeText={(t) => setAcademic((a) => (a ? { ...a, totalMarks: t } : a))}
            keyboardType="decimal-pad"
          />
          <FormTextInput
            label="Weightage (edit)"
            value={String(academic?.weightage ?? "")}
            onChangeText={(t) => setAcademic((a) => (a ? { ...a, weightage: t } : a))}
            keyboardType="decimal-pad"
          />
          {viewMarks.map((m, i) => (
            <View key={String(m.studentId ?? i)} style={styles.markCard}>
              <Text style={styles.roll}>{String(m.rollNumber ?? "")}</Text>
              <Text style={styles.nm}>{String(m.name ?? "")}</Text>
              <TextInput
                style={styles.markIn}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#94a3b8"
                value={String(m.obtainedMarks ?? m.marks ?? "")}
                onChangeText={(t) => {
                  const next = [...viewMarks];
                  next[i] = { ...next[i], obtainedMarks: t };
                  setAcademic((a) => (a ? { ...a, marks: next } : a));
                }}
              />
            </View>
          ))}
          <PrimaryButton title="Update marks" loading={busy} onPress={() => void updateMarks()} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#f1f5f9" },
  inner: { padding: 16, paddingBottom: 40 },
  hero: { marginBottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  heroSub: { marginTop: 6, fontSize: 14, color: "#64748b", lineHeight: 20 },
  panel: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modeRow: { flexDirection: "row", marginBottom: 16 },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  modeOn: { backgroundColor: "#1a365d", borderColor: "#1a365d" },
  modeTxt: { fontWeight: "600", color: "#4a5568" },
  modeTxtOn: { color: "#fff" },
  markCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  roll: { width: 52, fontSize: 13, color: "#4a5568", fontWeight: "700" },
  nm: { flex: 1, fontSize: 14, color: "#1a202c", fontWeight: "600" },
  hint: { color: "#718096", marginBottom: 8, fontSize: 13 },
  markIn: {
    width: 64,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 8,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
});
