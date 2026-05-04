import type { StackNavigationProp } from "@react-navigation/stack";
import React, { useRef, useState } from "react";
import { Keyboard, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { adminEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { FormTextInput, PrimaryButton } from "../components";
import type { RootStackParamList } from "../navigation/types";
import { toastError, toastSuccess } from "../utils/toasts";

type Nav = StackNavigationProp<RootStackParamList, "AdminSignup">;

type FormFields = { fname: string; lname: string; email: string; password: string };

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export default function AdminSignupScreen({ navigation }: { navigation: Nav }) {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef<FormFields>({ fname: "", lname: "", email: "", password: "" });

  async function handleSignup() {
    Keyboard.dismiss();
    await delay(Platform.OS === "web" ? 0 : 120);

    const payload = {
      fname: (formRef.current.fname || fname).trim(),
      lname: (formRef.current.lname || lname).trim(),
      email: (formRef.current.email || email).trim(),
      password: formRef.current.password ?? password,
    };

    if (!payload.fname) {
      toastError("First name is required.");
      return;
    }
    if (!payload.lname) {
      toastError("Last name is required.");
      return;
    }
    if (!payload.email) {
      toastError("Email is required.");
      return;
    }
    if (!payload.password) {
      toastError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchResponse(adminEndpoints.registerAdmin(), 1, payload);
      if (!res?.success) {
        toastError(res?.message ?? "Registration failed");
        return;
      }
      toastSuccess(res.message ?? "Registered");
      navigation.navigate("AdminLogin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Admin sign up</Text>
      <Text style={styles.hint}>Matches the web admin registration flow.</Text>
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
            textContentType="givenName"
            autoCorrect={false}
            blurOnSubmit={false}
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
            textContentType="familyName"
            autoCorrect={false}
            blurOnSubmit={false}
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
        textContentType="emailAddress"
        autoCorrect={false}
        blurOnSubmit={false}
      />
      <FormTextInput
        label="Password"
        value={password}
        onChangeText={(t) => {
          formRef.current.password = t;
          setPassword(t);
        }}
        secureTextEntry
        textContentType="newPassword"
        autoCorrect={false}
        blurOnSubmit
      />
      <PrimaryButton title="Register" loading={loading} onPress={() => void handleSignup()} />
      <Text style={styles.footer}>
        Already have an account?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("AdminLogin")}>
          Sign in
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 24, paddingBottom: 40, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", color: "#1a202c", marginBottom: 8 },
  hint: { fontSize: 14, color: "#718096", marginBottom: 20, lineHeight: 20 },
  row: { flexDirection: "row", marginHorizontal: -6 },
  half: { flex: 1, paddingHorizontal: 6 },
  footer: { marginTop: 20, fontSize: 15, color: "#4a5568", textAlign: "center" },
  link: { color: "#1a365d", fontWeight: "700" },
});
