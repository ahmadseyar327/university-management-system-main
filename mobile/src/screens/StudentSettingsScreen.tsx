import type { DrawerScreenProps } from "@react-navigation/drawer";
import React, { useRef, useState } from "react";
import { Keyboard, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { studentEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { FormTextInput, PrimaryButton } from "../components";
import { useAuth, type UserRecord } from "../contexts/AuthContext";
import type { StudentTabParamList } from "../navigation/types";
import { mongoId } from "../utils/mongoId";
import { toastError, toastSuccess } from "../utils/toasts";

type Props = DrawerScreenProps<StudentTabParamList, "StudentSettings">;

type Form = { fname: string; lname: string; email: string; password: string };

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export default function StudentSettingsScreen(_props: Props) {
  const { studentData, setStudentData } = useAuth();
  const studentId = mongoId(studentData);
  const [fname, setFname] = useState(String(studentData?.fname ?? ""));
  const [lname, setLname] = useState(String(studentData?.lname ?? ""));
  const [email, setEmail] = useState(String(studentData?.email ?? ""));
  const [password, setPassword] = useState(String(studentData?.password ?? ""));
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
      const res = await fetchResponse(studentEndpoints.editStudent(studentId), 2, body);
      if (!res?.success) {
        toastError(res?.message ?? "Update failed");
        return;
      }
      toastSuccess(res.message ?? "Updated");
      const next = { ...(studentData ?? {}), ...body } as UserRecord;
      setStudentData(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Edit profile</Text>
      <View style={styles.row}>
        <View style={styles.half}>
          <FormTextInput
            label="First name"
            value={fname}
            onChangeText={(t) => {
              formRef.current.fname = t;
              setFname(t);
            }}
            autoCapitalize="words"
          />
        </View>
        <View style={styles.half}>
          <FormTextInput
            label="Last name"
            value={lname}
            onChangeText={(t) => {
              formRef.current.lname = t;
              setLname(t);
            }}
            autoCapitalize="words"
          />
        </View>
      </View>
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
  row: { flexDirection: "row", marginHorizontal: -6 },
  half: { flex: 1, paddingHorizontal: 6 },
});
