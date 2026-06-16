import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useCallback, useEffect, useState } from "react";
import { Keyboard, Platform, StyleSheet, Text, View } from "react-native";
import { programEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { FormTextInput, PrimaryButton, ScreenContainer, ScreenHeader, SimpleSelect } from "../components";
import type { SelectOption } from "../components/SimpleSelect";
import { useAuth } from "../contexts/AuthContext";
import type { AdminTabParamList } from "../navigation/types";
import { colors, radius, shadow, spacing } from "../theme";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Props = DrawerScreenProps<AdminTabParamList, "AdminRegCourse">;
type Semester = { _id?: string; semesterNumber?: number; title?: string };

const typeOpts: SelectOption[] = [
  { label: "Core", value: "Core" },
  { label: "Elective", value: "Elective" },
];

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export default function AdminRegisterCourseScreen({ navigation }: Props) {
  const { adminData } = useAuth();
  const adminId = mongoId(adminData);
  const [programs, setPrograms] = useState<Record<string, unknown>[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [programId, setProgramId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("Core");
  const [fee, setFee] = useState("");
  const [creditHours, setCreditHours] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPrograms = useCallback(async () => {
    const res = await fetchResponse(programEndpoints.getPrograms(), 0, null);
    if (res?.success) {
      const data = (res.data as Record<string, unknown>[]) ?? [];
      setPrograms(data);
      if (data.length) setProgramId(String(data[0]._id ?? ""));
    }
  }, []);

  useEffect(() => {
    void loadPrograms();
  }, [loadPrograms]);

  useEffect(() => {
    if (!programId) {
      setSemesters([]);
      setSemesterId("");
      return;
    }
    void (async () => {
      const res = await fetchResponse(programEndpoints.getProgramById(programId), 0, null);
      if (res?.success) {
        const sems = (res.data?.semesters as Semester[]) ?? [];
        setSemesters(sems);
        if (sems.length) setSemesterId(String(sems[0]._id ?? ""));
      }
    })();
  }, [programId]);

  const programOpts: SelectOption[] = programs.map((p) => ({
    label: String(p.name ?? "Program"),
    value: String(p._id ?? ""),
  }));

  const semesterOpts: SelectOption[] = semesters.map((s) => ({
    label: `Semester ${s.semesterNumber ?? ""} — ${s.title ?? ""}`,
    value: String(s._id ?? ""),
  }));

  async function submit() {
    Keyboard.dismiss();
    await delay(Platform.OS === "web" ? 0 : 120);
    if (!semesterId || !title.trim() || !code.trim() || !fee || !creditHours) {
      toastError("Fill program, semester, title, code, fee, and credit hours.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetchResponse(programEndpoints.addCourseToSemester(), 1, {
        semesterId,
        title: title.trim(),
        code: code.trim(),
        description: description.trim(),
        type,
        fee: Number(fee),
        creditHours: Number(creditHours),
        adminId,
      });
      if (!res?.success) {
        toastError(res?.message ?? "Could not add course");
        return;
      }
      toastSuccess(res.message ?? "Course added to semester");
      setTitle("");
      setCode("");
      setDescription("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Add semester course"
        subtitle="Courses belong to a program semester."
        onBack={() => navigation.goBack()}
      />

      <View style={[styles.panel, shadow.soft]}>
        <SimpleSelect label="Program" options={programOpts} value={programId} onChange={setProgramId} />
        <SimpleSelect label="Semester" options={semesterOpts} value={semesterId} onChange={setSemesterId} />
        <FormTextInput label="Title" value={title} onChangeText={setTitle} />
        <FormTextInput label="Code" value={code} onChangeText={setCode} autoCapitalize="characters" />
        <SimpleSelect label="Type" options={typeOpts} value={type} onChange={setType} />
        <FormTextInput label="Fee" value={fee} onChangeText={setFee} keyboardType="decimal-pad" />
        <FormTextInput label="Credit hours" value={creditHours} onChangeText={setCreditHours} keyboardType="numeric" />
        <FormTextInput label="Description" value={description} onChangeText={setDescription} multiline />
        <PrimaryButton title="Add to semester" loading={loading} onPress={() => void submit()} />
      </View>

      <Text style={styles.note}>After adding courses, assign instructors via Offer courses.</Text>
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
    gap: spacing.sm,
  },
  note: { marginTop: spacing.md, color: colors.textSecondary, fontSize: 13, textAlign: "center" },
});
