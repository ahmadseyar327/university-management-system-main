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

export default function StudentRegisterCourseScreen({ navigation }: Props) {
  const { studentData } = useAuth();
  const studentId = mongoId(studentData);
  const [programs, setPrograms] = useState<Record<string, unknown>[]>([]);
  const [programId, setProgramId] = useState("");
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
      await loadPrograms();
      setLoading(false);
    })();
  }, [loadPrograms]);

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

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Enroll in program"
        subtitle="Semester 1 courses are assigned automatically."
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
});
