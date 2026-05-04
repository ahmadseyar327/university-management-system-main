import type { StackNavigationProp } from "@react-navigation/stack";
import React, { useRef, useState } from "react";
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { adminEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { AuthScreenShell, FormTextInput, PrimaryButton } from "../components";
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
    <AuthScreenShell
      roleBadge="Administrator account"
      badgeTone="admin"
      title="Create account"
      subtitle="You are registering as a system administrator. This matches the web admin registration flow. Use only if your institution permits it."
      footer={
        <View style={styles.footer}>
          <Text style={styles.footerMuted}>Already have access?</Text>
          <Pressable
            onPress={() => navigation.navigate("AdminLogin")}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Sign in as administrator"
          >
            <Text style={styles.footerLink}>Sign in</Text>
          </Pressable>
        </View>
      }
    >
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
      <PrimaryButton title="Create account" loading={loading} onPress={() => void handleSignup()} />
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", marginHorizontal: -6 },
  half: { flex: 1, paddingHorizontal: 6 },
  footer: { marginTop: 28, alignItems: "center" },
  footerMuted: { fontSize: 14, color: "#64748b", marginBottom: 6 },
  footerLink: { fontSize: 16, fontWeight: "700", color: "#c2410c" },
});
