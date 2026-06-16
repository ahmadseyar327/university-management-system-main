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

type Props = DrawerScreenProps<InstructorTabParamList, "InstructorMarks">;

export default function InstructorMarksScreen({ navigation }: Props) {
  const { instructorData } = useAuth();
  const instructorId = mongoId(instructorData);
  const [students, setStudents] = useState<Stud[]>([]);
  const [course, setCourse] = useState("");
  const [programId, setProgramId] = useState("");
  const [semesterNumber, setSemesterNumber] = useState("");
  const [rows, setRows] = useState<MarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadStudents = useCallback(async () => {
    const res = await fetchResponse(courseEndpoints.getStudentsOfInstructor(instructorId), 0, null);
    if (!res?.success) {
      toastError(res?.message ?? "Could not load students");
      setStudents([]);
      return;
    }
    setStudents((res.data as Stud[]) ?? []);
  }, [instructorId]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadStudents();
      setLoading(false);
    })();
  }, [loadStudents]);

  const courseOpts: SelectOption[] = useMemo(() => {
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

  useEffect(() => {
    if (!course) {
      setRows([]);
      return;
    }
    const sample = students.find((s) => String(s.courseId) === course);
    const prog = String(sample?.programId ?? "");
    const sem = String(sample?.semesterNumber ?? "");
    setProgramId(prog);
    setSemesterNumber(sem);

    void (async () => {
      if (prog && sem) {
        const res = await fetchResponse(
          academicEndpoints.getCourseResultsForInstructor(instructorId, course, Number(sem)),
          0,
          null
        );
        if (res?.success) {
          setRows(
            ((res.data as MarkRow[]) ?? []).map((r) => ({
              studentId: String(r.studentId),
              rollNumber: r.rollNumber,
              name: String(r.name ?? ""),
              midExamMarks: String(r.midExamMarks ?? 0),
              finalExamMarks: String(r.finalExamMarks ?? 0),
            }))
          );
          return;
        }
      }
      setRows(
        students
          .filter((s) => String(s.courseId) === course)
          .map((s) => ({
            studentId: mongoId(s),
            rollNumber: s.rollNumber,
            name: `${String(s.fname ?? "")} ${String(s.lname ?? "")}`.trim(),
            midExamMarks: "0",
            finalExamMarks: "0",
          }))
      );
    })();
  }, [course, instructorId, students]);

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
