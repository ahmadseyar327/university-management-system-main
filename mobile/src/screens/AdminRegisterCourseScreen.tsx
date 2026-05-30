import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useRef, useState } from "react";
import { Keyboard, Platform, StyleSheet, View } from "react-native";
import { courseEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { FormTextInput, PrimaryButton, ScreenContainer, ScreenHeader, SimpleSelect } from "../components";
import type { SelectOption } from "../components/SimpleSelect";
import { useAuth } from "../contexts/AuthContext";
import type { AdminTabParamList } from "../navigation/types";
import { colors, radius, shadow, spacing } from "../theme";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Props = DrawerScreenProps<AdminTabParamList, "AdminRegCourse">;

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
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("");
  const [fee, setFee] = useState("");
  const [creditHours, setCreditHours] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef({ title, code, type, fee, creditHours });

  async function submit() {
    Keyboard.dismiss();
    await delay(Platform.OS === "web" ? 0 : 120);
    const body = {
      title: (ref.current.title || title).trim(),
      code: (ref.current.code || code).trim(),
      type: ref.current.type || type,
      fee: ref.current.fee || fee,
      creditHours: ref.current.creditHours || creditHours,
      adminId,
    };
    if (!body.title || !body.code || !body.type || !body.fee || !body.creditHours) {
      toastError("All fields required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetchResponse(courseEndpoints.registerCourse(), 1, body);
      if (!res?.success) {
        toastError(res?.message ?? "Failed");
        return;
      }
      toastSuccess(res.message ?? "Created");
      navigation.navigate("AdminCourses");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Register course" subtitle="Add a new course to the catalog." />
      <View style={[styles.card, shadow.card]}>
        <FormTextInput
          label="Title"
          value={title}
          onChangeText={(t) => {
            ref.current.title = t;
            setTitle(t);
          }}
        />
        <FormTextInput
          label="Code"
          value={code}
          onChangeText={(t) => {
            ref.current.code = t;
            setCode(t);
          }}
          autoCapitalize="characters"
        />
        <SimpleSelect
          label="Type"
          options={typeOpts}
          value={type}
          onChange={(v) => {
            ref.current.type = v;
            setType(v);
          }}
        />
        <FormTextInput
          label="Credit hours"
          value={creditHours}
          onChangeText={(t) => {
            ref.current.creditHours = t;
            setCreditHours(t);
          }}
          keyboardType="numeric"
        />
        <FormTextInput
          label="Fee"
          value={fee}
          onChangeText={(t) => {
            ref.current.fee = t;
            setFee(t);
          }}
          keyboardType="decimal-pad"
        />
        <PrimaryButton title="Register course" loading={loading} onPress={() => void submit()} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
