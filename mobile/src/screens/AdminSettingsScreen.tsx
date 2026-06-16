import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useRef, useState } from "react";
import { Keyboard, Platform, StyleSheet, View } from "react-native";
import { adminEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { FormTextInput, PrimaryButton, ScreenContainer, ScreenHeader } from "../components";
import { useAuth, type UserRecord } from "../contexts/AuthContext";
import type { AdminTabParamList } from "../navigation/types";
import { colors, radius, shadow, spacing } from "../theme";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Props = DrawerScreenProps<AdminTabParamList, "AdminSettings">;

type Form = { fname: string; lname: string; email: string; password: string };

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export default function AdminSettingsScreen({ navigation }: Props) {
  const { adminData, setAdminData } = useAuth();
  const adminId = mongoId(adminData);
  const [fname, setFname] = useState(String(adminData?.fname ?? ""));
  const [lname, setLname] = useState(String(adminData?.lname ?? ""));
  const [email, setEmail] = useState(String(adminData?.email ?? ""));
  const [password, setPassword] = useState(String(adminData?.password ?? ""));
  const [loading, setLoading] = useState(false);
  const formRef = useRef<Form>({ fname, lname, email, password });

  async function save() {
    Keyboard.dismiss();
    await delay(Platform.OS === "web" ? 0 : 120);
    const body = {
      fname: (formRef.current.fname || fname).trim(),
      lname: (formRef.current.lname || lname).trim(),
      email: (formRef.current.email || email).trim(),
      password: formRef.current.password ?? password,
    };
    if (!body.fname || !body.lname || !body.email || !body.password) {
      toastError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetchResponse(adminEndpoints.editAdmin(adminId), 2, body);
      if (!res?.success) {
        toastError(res?.message ?? "Update failed");
        return;
      }
      toastSuccess(res.message ?? "Updated");
      setAdminData({ ...(adminData ?? {}), ...body } as UserRecord);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Settings" subtitle="Update your admin profile and password." onBack={() => navigation.goBack()} />
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
        <PrimaryButton title="Save changes" loading={loading} onPress={() => void save()} />
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
