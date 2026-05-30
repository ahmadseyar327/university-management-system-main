import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { courseEndpoints, instructorEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import {
  FadeInView,
  FormTextInput,
  PrimaryButton,
  ScreenContainer,
  ScreenHeader,
  SegmentedTabs,
  SimpleSelect,
} from "../components";
import type { SelectOption } from "../components/SimpleSelect";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { InstructorTabParamList } from "../navigation/types";
import { colors, radius, roleThemes, shadow, spacing } from "../theme";
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
  name?: string;
  obtainedMarks?: unknown;
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
        obtainedMarks: s.obtainedMarks ?? "",
        isPublic: true,
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

  const postReady = course && examType && activityNumber && totalMarks && weightage;
  const filled = marksRows.filter((m) => m.obtainedMarks !== "" && m.obtainedMarks != null).length;

  async function postMarks() {
    if (!postReady) {
      toastError("Fill course, exam, activity #, total marks, and weightage.");
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
      else toastSuccess(res.message ?? "Marks published");
    } finally {
      setBusy(false);
    }
  }

  const viewMarks = (academic?.marks as Stud[]) ?? [];

  async function updateMarks() {
    if (!academic?._id) {
      toastError("Complete filters to load marks first.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetchResponse(instructorEndpoints.editAcademics(String(academic._id)), 2, {
        ...academic,
        marks: viewMarks,
      });
      if (!res?.success) toastError(res?.message ?? "Update failed");
      else toastSuccess(res.message ?? "Saved");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingView />;

  return (
    <ScreenContainer>
      <ScreenHeader title="Marks" subtitle="Post new grades or update an existing activity." />

      <FadeInView>
        <SegmentedTabs
          tabs={[
            { key: "post", label: "Post marks" },
            { key: "view", label: "View / edit" },
          ]}
          active={mode}
          onChange={(k) => setMode(k as "post" | "view")}
          accent={roleThemes.instructor.accent}
        />
      </FadeInView>

      <FadeInView delay={60}>
        <View style={[styles.panel, shadow.soft]}>
          <Text style={styles.step}>Assessment</Text>
          <SimpleSelect label="Course" options={courseOpts} value={course} onChange={setCourse} />
          <SimpleSelect label="Exam type" options={examOpts} value={examType} onChange={setExamType} />
          <FormTextInput
            label="Activity number"
            value={activityNumber}
            onChangeText={setActivityNumber}
            keyboardType="numeric"
          />
          {mode === "post" ? (
            <>
              <FormTextInput
                label="Total marks"
                value={totalMarks}
                onChangeText={setTotalMarks}
                keyboardType="decimal-pad"
              />
              <FormTextInput
                label="Weightage"
                value={weightage}
                onChangeText={setWeightage}
                keyboardType="decimal-pad"
              />
            </>
          ) : null}
        </View>
      </FadeInView>

      {mode === "post" ? (
        <FadeInView delay={100}>
          {!course ? (
            <Text style={styles.hint}>Select a course to load students.</Text>
          ) : !postReady ? (
            <Text style={styles.hint}>Complete all assessment fields above.</Text>
          ) : (
            <>
              <View style={styles.progressWrap}>
                <Text style={styles.progressLbl}>
                  {filled} of {marksRows.length} graded
                </Text>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      { width: marksRows.length ? `${(filled / marksRows.length) * 100}%` : "0%" },
                    ]}
                  />
                </View>
              </View>
              {marksRows.map((m, i) => (
                <View key={mongoId(m)} style={[styles.markCard, shadow.soft]}>
                  <Text style={styles.roll}>{String(m.rollNumber ?? "")}</Text>
                  <Text style={styles.nm} numberOfLines={1}>
                    {String(m.name)}
                  </Text>
                  <TextInput
                    style={styles.markIn}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    value={String(m.obtainedMarks ?? "")}
                    onChangeText={(t) => {
                      const next = [...marksRows];
                      next[i] = { ...next[i], obtainedMarks: t };
                      setMarksRows(next);
                    }}
                  />
                </View>
              ))}
              <PrimaryButton title="Publish marks" loading={busy} onPress={() => void postMarks()} />
            </>
          )}
        </FadeInView>
      ) : (
        <FadeInView delay={100}>
          {!academic ? (
            <Text style={styles.hint}>Enter activity # — marks load automatically.</Text>
          ) : (
            <>
              <FormTextInput
                label="Total marks"
                value={String(academic?.totalMarks ?? "")}
                onChangeText={(t) => setAcademic((a) => (a ? { ...a, totalMarks: t } : a))}
                keyboardType="decimal-pad"
              />
              <FormTextInput
                label="Weightage"
                value={String(academic?.weightage ?? "")}
                onChangeText={(t) => setAcademic((a) => (a ? { ...a, weightage: t } : a))}
                keyboardType="decimal-pad"
              />
              {viewMarks.map((m, i) => (
                <View key={String(m.studentId ?? i)} style={[styles.markCard, shadow.soft]}>
                  <Text style={styles.roll}>{String(m.rollNumber ?? "")}</Text>
                  <Text style={styles.nm} numberOfLines={1}>
                    {String(m.name ?? "")}
                  </Text>
                  <TextInput
                    style={styles.markIn}
                    keyboardType="decimal-pad"
                    value={String(m.obtainedMarks ?? m.marks ?? "")}
                    onChangeText={(t) => {
                      const next = [...viewMarks];
                      next[i] = { ...next[i], obtainedMarks: t };
                      setAcademic((a) => (a ? { ...a, marks: next } : a));
                    }}
                  />
                </View>
              ))}
              <PrimaryButton title="Save changes" loading={busy} onPress={() => void updateMarks()} />
            </>
          )}
        </FadeInView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  step: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  hint: {
    color: colors.textSecondary,
    textAlign: "center",
    padding: spacing.lg,
    fontSize: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  progressWrap: { marginBottom: spacing.md },
  progressLbl: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  track: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: roleThemes.instructor.accent },
  markCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roll: { width: 48, fontSize: 12, color: colors.textMuted, fontWeight: "700" },
  nm: { flex: 1, fontSize: 14, color: colors.text, fontWeight: "600", marginRight: 8 },
  markIn: {
    width: 64,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 8,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
  },
});
