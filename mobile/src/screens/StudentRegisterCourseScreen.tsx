import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { academicEndpoints, programEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { FadeInView, PrimaryButton, ScreenContainer, ScreenHeader, SimpleSelect } from "../components";
import type { SelectOption } from "../components/SimpleSelect";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { StudentTabParamList } from "../navigation/types";
import { colors, radius, spacing } from "../theme";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Props = DrawerScreenProps<StudentTabParamList, "StudentRegister">;
type ExistingEnrollment = {
  programName?: string;
  currentSemester?: number;
  status?: string;
};

export default function StudentRegisterCourseScreen({ navigation }: Props) {
  const { studentData } = useAuth();
  const studentId = mongoId(studentData);
  const [programs, setPrograms] = useState<Record<string, unknown>[]>([]);
  const [programId, setProgramId] = useState("");
  const [existingEnrollment, setExistingEnrollment] = useState<ExistingEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadPrograms = useCallback(async () => {
    const res = await fetchResponse(programEndpoints.getPrograms(), 0, null);
    if (!res?.success) {
      toastError(res?.message ?? "Could not load programs");
      setPrograms([]);
      return;
    }
    const data = (res.data as Record<string, unknown>[]) ?? [];
    setPrograms(data);
    if (data.length) setProgramId(String(data[0]._id ?? ""));
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      if (studentId) {
        const recordRes = await fetchResponse(academicEndpoints.getStudentRecord(studentId), 0, null);
        if (recordRes?.success) {
          setExistingEnrollment(recordRes.data as ExistingEnrollment);
          setLoading(false);
          return;
        }
      }
      await loadPrograms();
      setLoading(false);
    })();
  }, [studentId, loadPrograms]);

  const opts: SelectOption[] = programs.map((p) => ({
    label: String(p.name ?? "Program"),
    value: String(p._id ?? ""),
  }));

  async function enroll() {
    if (!studentId || !programId) return;
    setSubmitting(true);
    try {
      const res = await fetchResponse(academicEndpoints.enrollInProgram(), 1, { studentId, programId });
      if (!res?.success) {
        toastError(res?.message ?? "Enrollment failed");
        return;
      }
      toastSuccess(res.message ?? "Enrolled in program");
      navigation.navigate("StudentCourses");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingView />;

  if (existingEnrollment) {
    return (
      <ScreenContainer>
        <ScreenHeader
          title="Already enrolled"
          subtitle="Each student can only enroll in one program."
          onBack={() => navigation.goBack()}
        />
        <FadeInView>
          <View style={styles.panel}>
            <Text style={styles.enrolledTitle}>{existingEnrollment.programName ?? "Your program"}</Text>
            <Text style={styles.enrolledSub}>
              Semester {existingEnrollment.currentSemester ?? "—"} · {existingEnrollment.status ?? "Active"}
            </Text>
            <Text style={styles.empty}>
              You are already enrolled. View your courses from the dashboard.
            </Text>
            <PrimaryButton title="Go to dashboard" onPress={() => navigation.navigate("StudentOverview")} />
          </View>
        </FadeInView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Enroll in program"
        subtitle="Choose one program — enrollment is permanent."
        onBack={() => navigation.goBack()}
      />

      <FadeInView>
        <View style={styles.panel}>
          {programs.length === 0 ? (
            <Text style={styles.empty}>No programs available yet. Contact administration.</Text>
          ) : (
            <>
              <SimpleSelect label="Program" options={opts} value={programId} onChange={setProgramId} />
              <PrimaryButton title="Enroll" loading={submitting} onPress={() => void enroll()} />
            </>
          )}
        </View>
      </FadeInView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  empty: { color: colors.textSecondary, textAlign: "center", paddingVertical: spacing.lg },
  enrolledTitle: { fontWeight: "700", fontSize: 16, color: colors.text },
  enrolledSub: { color: colors.textSecondary, fontSize: 13 },
});
