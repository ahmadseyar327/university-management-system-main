import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useRef, useState } from "react";
import { Keyboard, Platform, StyleSheet, View } from "react-native";
import { instructorEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { FormTextInput, PrimaryButton, ScreenContainer, ScreenHeader } from "../components";
import type { AdminTabParamList } from "../navigation/types";
import { colors, radius, shadow, spacing } from "../theme";
import { toastError, toastSuccess } from "../utils/toasts";

type Props = DrawerScreenProps<AdminTabParamList, "AdminRegInstructor">;

type Form = { fname: string; lname: string; email: string; password: string };

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export default function AdminRegisterInstructorScreen({ navigation }: Props) {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef<Form>({ fname: "", lname: "", email: "", password: "" });

  async function submit() {
    Keyboard.dismiss();
    await delay(Platform.OS === "web" ? 0 : 120);
    const body = {
      fname: (formRef.current.fname || fname).trim(),
      lname: (formRef.current.lname || lname).trim(),
      email: (formRef.current.email || email).trim(),
      password: formRef.current.password ?? password,
    };
    if (!body.fname || !body.lname || !body.email || !body.password) {
      toastError("All fields required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetchResponse(instructorEndpoints.registerInstructor(), 1, body);
      if (!res?.success) {
        toastError(res?.message ?? "Registration failed");
        return;
      }
      toastSuccess(res.message ?? "Created");
      navigation.navigate("AdminInstructors");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Register instructor" subtitle="Create a new faculty account." />
      <View style={[styles.card, shadow.card]}>
        <View style={styles.row}>
          <View style={styles.half}>
            <FormTextInput label="First name" value={fname} onChangeText={(t) => { formRef.current.fname = t; setFname(t); }} autoCapitalize="words" />
          </View>
          <View style={styles.half}>
            <FormTextInput label="Last name" value={lname} onChangeText={(t) => { formRef.current.lname = t; setLname(t); }} autoCapitalize="words" />
          </View>
        </View>
        <FormTextInput label="Email" value={email} onChangeText={(t) => { formRef.current.email = t; setEmail(t); }} autoCapitalize="none" keyboardType="email-address" />
        <FormTextInput label="Password" value={password} onChangeText={(t) => { formRef.current.password = t; setPassword(t); }} secureTextEntry />
        <PrimaryButton title="Register" loading={loading} onPress={() => void submit()} />
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
  row: { flexDirection: "row", marginHorizontal: -6 },
  half: { flex: 1, paddingHorizontal: 6 },
});
