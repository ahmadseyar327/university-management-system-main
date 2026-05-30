import type { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { adminEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { AuthScreenShell, FormTextInput, PrimaryButton } from "../components";
import { useAuth } from "../contexts/AuthContext";
import type { RootStackParamList } from "../navigation/types";
import { toastError, toastSuccess } from "../utils/toasts";

type Nav = StackNavigationProp<RootStackParamList, "AdminLogin">;

export default function AdminLoginScreen({ navigation }: { navigation: Nav }) {
  const { setAdminData } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const res = await fetchResponse(adminEndpoints.loginAdmin(), 1, {
        email,
        password,
      });
      if (!res?.success || !res.data) {
        toastError(res?.message ?? "Login failed");
        return;
      }
      setAdminData(res.data as Record<string, unknown>);
      toastSuccess(res.message ?? "Signed in");
      navigation.reset({ index: 0, routes: [{ name: "AdminTabs" }] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenShell
      badgeTone="admin"
      eyebrow="Administrator"
      title="Sign in"
      subtitle="Manage instructors, courses, and institutional data. Same credentials as the web admin panel."
    >
      <FormTextInput
        label="Work email"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <FormTextInput
        label="Password"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <PrimaryButton title="Sign in" loading={loading} onPress={() => void handleLogin()} />
    </AuthScreenShell>
  );
}
