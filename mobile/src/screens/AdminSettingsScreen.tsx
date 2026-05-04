import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import React, { useRef, useState } from "react";
import { Keyboard, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { adminEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { FormTextInput, PrimaryButton } from "../components";
import { useAuth, type UserRecord } from "../contexts/AuthContext";
import type { AdminTabParamList } from "../navigation/types";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Props = BottomTabScreenProps<AdminTabParamList, "AdminSettings">;

type Form = { fname: string; lname: string; email: string; password: string };

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export default function AdminSettingsScreen(_props: Props) {
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
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Edit admin profile</Text>
      <FormTextInput
        label="First name"
        value={fname}
        onChangeText={(t) => {
          formRef.current.fname = t;
          setFname(t);
        }}
        autoCapitalize="words"
      />
      <FormTextInput
        label="Last name"
        value={lname}
        onChangeText={(t) => {
          formRef.current.lname = t;
          setLname(t);
        }}
        autoCapitalize="words"
      />
      <FormTextInput
        label="Email"
        value={email}
        onChangeText={(t) => {
          formRef.current.email = t;
          setEmail(t);
        }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <FormTextInput
        label="Password"
        value={password}
        onChangeText={(t) => {
          formRef.current.password = t;
          setPassword(t);
        }}
        secureTextEntry
      />
      <PrimaryButton title="Save changes" loading={loading} onPress={() => void save()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 16, color: "#1a202c" },
});
