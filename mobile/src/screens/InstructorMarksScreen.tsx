import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { academicEndpoints, courseEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import {
  FadeInView,
  PrimaryButton,
  ScreenContainer,
  ScreenHeader,
  SimpleSelect,
} from "../components";
import type { SelectOption } from "../components/SimpleSelect";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { InstructorTabParamList } from "../navigation/types";
import { colors, radius, roleThemes, shadow, spacing } from "../theme";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Stud = Record<string, unknown> & {
  _id?: string;
  courseId?: string;
  courseTitle?: string;
  programId?: string;
  semesterNumber?: number;
  fname?: string;
  lname?: string;
  rollNumber?: unknown;
};

type MarkRow = {
  studentId: string;
  rollNumber?: unknown;
  name: string;
  midExamMarks: string;
  finalExamMarks: string;
};

type CourseRow = Record<string, unknown> & {
  _id?: string;
  title?: string;
  semesterNumber?: number;
  programId?: string;
  status?: string;
};

type Props = DrawerScreenProps<InstructorTabParamList, "InstructorMarks">;

export default function InstructorMarksScreen({ navigation }: Props) {
  const { instructorData } = useAuth();
  const instructorId = mongoId(instructorData);
  const [students, setStudents] = useState<Stud[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<CourseRow[]>([]);
  const [course, setCourse] = useState("");
  const [programId, setProgramId] = useState("");
  const [semesterNumber, setSemesterNumber] = useState("");
  const [rows, setRows] = useState<MarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadStudents = useCallback(async () => {
    const [studentsRes, coursesRes] = await Promise.all([
      fetchResponse(courseEndpoints.getStudentsOfInstructor(instructorId), 0, null),
      fetchResponse(courseEndpoints.getCoursesOfInstructor(instructorId), 0, null),
    ]);
    if (!studentsRes?.success) {
      toastError(studentsRes?.message ?? "Could not load students");
      setStudents([]);
    } else {
      setStudents(
        ((studentsRes.data as Stud[]) ?? []).map((s) => ({
          ...s,
          courseId: String(s.courseId ?? ""),
        }))
      );
    }
    if (coursesRes?.success) {
      setInstructorCourses(
        ((coursesRes.data as CourseRow[]) ?? []).filter((c) => c.status === "approved")
      );
    } else {
      setInstructorCourses([]);
    }
  }, [instructorId]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadStudents();
      setLoading(false);
    })();
  }, [loadStudents]);

  const courseOpts: SelectOption[] = useMemo(() => {
    return instructorCourses
      .sort((a, b) => String(a.title).localeCompare(String(b.title)))
      .map((c) => ({
        label: c.semesterNumber
          ? `Sem ${c.semesterNumber} · ${String(c.title ?? "")}`
          : String(c.title ?? ""),
        value: String(c._id ?? ""),
      }));
  }, [instructorCourses]);

  useEffect(() => {
    if (!course) {
      setRows([]);
      setProgramId("");
      setSemesterNumber("");
      return;
    }
    const selected = instructorCourses.find((c) => String(c._id) === course);
    const prog = String(selected?.programId ?? "");
    const sem = String(selected?.semesterNumber ?? "");
    setProgramId(prog);
    setSemesterNumber(sem);

    void (async () => {
      const courseStudents = students
        .filter((s) => String(s.courseId) === course)
        .map((s) => ({
          studentId: mongoId(s),
          rollNumber: s.rollNumber,
          name: `${String(s.fname ?? "")} ${String(s.lname ?? "")}`.trim(),
          midExamMarks: "0",
          finalExamMarks: "0",
        }));

      if (!prog || !sem) {
        setRows(courseStudents);
        return;
      }

      const res = await fetchResponse(
        academicEndpoints.getCourseResultsForInstructor(instructorId, course, Number(sem)),
        0,
        null
      );
      if (res?.success && (res.data as MarkRow[])?.length) {
        setRows(
          ((res.data as MarkRow[]) ?? []).map((r) => ({
            studentId: String(r.studentId),
            rollNumber: r.rollNumber,
            name: String(r.name ?? ""),
            midExamMarks: String(r.midExamMarks ?? 0),
            finalExamMarks: String(r.finalExamMarks ?? 0),
          }))
        );
      } else {
        setRows(courseStudents);
      }
    })();
  }, [course, instructorId, students, instructorCourses]);

  async function saveMarks() {
    if (!course || !programId || !semesterNumber) {
      toastError("Course must be linked to a semester enrollment.");
      return;
    }
    setBusy(true);
    try {
      for (const row of rows) {
        const res = await fetchResponse(academicEndpoints.saveCourseResult(), 1, {
          studentId: row.studentId,
          courseId: course,
          instructorId,
          programId,
          semesterNumber: Number(semesterNumber),
          midExamMarks: Number(row.midExamMarks) || 0,
          finalExamMarks: Number(row.finalExamMarks) || 0,
        });
        if (!res?.success) {
          toastError(res?.message ?? "Save failed");
          return;
        }
      }
      toastSuccess("Marks saved");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingView />;

  return (
    <ScreenContainer>
      <ScreenHeader title="Semester marks" subtitle="Mid (20) + Final (80)" onBack={() => navigation.goBack()} />

      <FadeInView>
        <View style={[styles.panel, shadow.soft]}>
          <SimpleSelect label="Course" options={courseOpts} value={course} onChange={setCourse} />
          {!courseOpts.length ? (
            <Text style={styles.hint}>No approved semester courses yet. Ask admin to approve your offers.</Text>
          ) : null}
          {semesterNumber ? (
            <Text style={styles.hint}>Semester {semesterNumber} · Pass threshold 55/100</Text>
          ) : null}
        </View>
      </FadeInView>

      {!course ? (
        <Text style={styles.empty}>Select a course to load students.</Text>
      ) : (
        <>
          {rows.map((row, i) => (
            <View key={row.studentId} style={[styles.markCard, shadow.soft]}>
              <Text style={styles.roll}>{String(row.rollNumber ?? "")}</Text>
              <Text style={styles.nm} numberOfLines={1}>
                {row.name}
              </Text>
              <TextInput
                style={styles.markIn}
                keyboardType="decimal-pad"
                placeholder="Mid"
                placeholderTextColor={colors.textMuted}
                value={row.midExamMarks}
                onChangeText={(t) => {
                  const next = [...rows];
                  next[i] = { ...next[i], midExamMarks: t };
                  setRows(next);
                }}
              />
              <TextInput
                style={styles.markIn}
                keyboardType="decimal-pad"
                placeholder="Fin"
                placeholderTextColor={colors.textMuted}
                value={row.finalExamMarks}
                onChangeText={(t) => {
                  const next = [...rows];
                  next[i] = { ...next[i], finalExamMarks: t };
                  setRows(next);
                }}
              />
            </View>
          ))}
          <PrimaryButton title="Save marks" loading={busy} onPress={() => void saveMarks()} />
        </>
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
  hint: { color: colors.textSecondary, fontSize: 13 },
  empty: {
    color: colors.textSecondary,
    textAlign: "center",
    padding: spacing.lg,
    fontSize: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.md,
  },
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
    width: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 8,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
    marginLeft: 4,
  },
});
