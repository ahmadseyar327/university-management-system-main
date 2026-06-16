import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { academicEndpoints, programEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { FormTextInput, PrimaryButton, ScreenContainer, SimpleSelect } from "../components";
import type { SelectOption } from "../components/SimpleSelect";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../contexts/AuthContext";
import type { AdminTabParamList } from "../navigation/types";
import { colors, radius, spacing } from "../theme";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Eligible = {
  studentId?: string;
  rollNumber?: string;
  name?: string;
  status?: string;
  currentSemester?: number;
};

type Props = DrawerScreenProps<AdminTabParamList, "AdminSemester">;

export default function AdminSemesterScreen(_props: Props) {
  const { adminData } = useAuth();
  const adminId = mongoId(adminData);
  const [programs, setPrograms] = useState<Record<string, unknown>[]>([]);
  const [programId, setProgramId] = useState("");
  const [semesterNumber, setSemesterNumber] = useState("1");
  const [targetSemester, setTargetSemester] = useState("2");
  const [eligible, setEligible] = useState<Eligible[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const semesterOpts: SelectOption[] = Array.from({ length: 8 }, (_, i) => ({
    label: `Semester ${i + 1}`,
    value: String(i + 1),
  }));

  const loadPrograms = useCallback(async () => {
    const res = await fetchResponse(programEndpoints.getPrograms(), 0, null);
    if (res?.success) {
      const data = (res.data as Record<string, unknown>[]) ?? [];
      setPrograms(data);
      if (data.length) setProgramId(String(data[0]._id ?? ""));
    }
  }, []);

  const loadEligible = useCallback(async () => {
    if (!programId || !semesterNumber) return;
    const res = await fetchResponse(
      academicEndpoints.adminEligibleStudents(programId, Number(semesterNumber)),
      0,
      null
    );
    if (res?.success) setEligible((res.data as Eligible[]) ?? []);
    else setEligible([]);
  }, [programId, semesterNumber]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadPrograms();
      setLoading(false);
    })();
  }, [loadPrograms]);

  useEffect(() => {
    void loadEligible();
  }, [loadEligible]);

  const programOpts: SelectOption[] = programs.map((p) => ({
    label: String(p.name ?? "Program"),
    value: String(p._id ?? ""),
  }));

  async function publish() {
    setBusy(true);
    try {
      const res = await fetchResponse(academicEndpoints.adminPublishSemester(), 1, {
        adminId,
        programId,
        semesterNumber: Number(semesterNumber),
      });
      if (!res?.success) toastError(res?.message ?? "Publish failed");
      else {
        toastSuccess(res.message ?? "Published");
        await loadEligible();
      }
    } finally {
      setBusy(false);
    }
  }

  async function openReg() {
    setBusy(true);
    try {
      const res = await fetchResponse(academicEndpoints.adminOpenRegistration(), 1, {
        adminId,
        programId,
        targetSemester: Number(targetSemester),
      });
      if (!res?.success) toastError(res?.message ?? "Failed");
      else toastSuccess(res.message ?? "Registration opened");
    } finally {
      setBusy(false);
    }
  }

  async function closeReg() {
    setBusy(true);
    try {
      const res = await fetchResponse(academicEndpoints.adminCloseRegistration(), 1, {
        programId,
        targetSemester: Number(targetSemester),
      });
      if (!res?.success) toastError(res?.message ?? "Failed");
      else toastSuccess(res.message ?? "Registration closed");
    } finally {
      setBusy(false);
    }
  }

  async function promote(studentId?: string) {
    if (!studentId) return;
    setBusy(true);
    try {
      const res = await fetchResponse(academicEndpoints.adminConfirmPromotion(), 1, { studentId });
      if (!res?.success) toastError(res?.message ?? "Promotion failed");
      else {
        toastSuccess(res.message ?? "Promoted");
        await loadEligible();
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingView />;

  return (
    <ScreenContainer>
      <View style={styles.panel}>
        <SimpleSelect label="Program" options={programOpts} value={programId} onChange={setProgramId} />
        <SimpleSelect label="Semester" options={semesterOpts} value={semesterNumber} onChange={setSemesterNumber} />
        <PrimaryButton title="Publish semester results" loading={busy} onPress={() => void publish()} />
      </View>

      <View style={styles.panel}>
        <FormTextInput label="Target semester (2–8)" value={targetSemester} onChangeText={setTargetSemester} keyboardType="numeric" />
        <PrimaryButton title="Open registration" loading={busy} onPress={() => void openReg()} />
        <PrimaryButton title="Close registration" loading={busy} onPress={() => void closeReg()} />
      </View>

      <Text style={styles.section}>Eligible students</Text>
      <FlatList
        data={eligible}
        keyExtractor={(item, i) => String(item.studentId ?? i)}
        ListEmptyComponent={<Text style={styles.empty}>No eligible students.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name ?? item.studentId}</Text>
              <Text style={styles.sub}>{item.rollNumber} · {item.status}</Text>
            </View>
            <PrimaryButton title="Promote" loading={busy} onPress={() => void promote(item.studentId)} />
          </View>
        )}
      />
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
  section: { fontWeight: "700", marginBottom: spacing.sm, color: colors.text },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  name: { fontWeight: "600", color: colors.text },
  sub: { color: colors.textSecondary, fontSize: 12 },
  empty: { color: colors.textSecondary, textAlign: "center", padding: spacing.lg },
});
