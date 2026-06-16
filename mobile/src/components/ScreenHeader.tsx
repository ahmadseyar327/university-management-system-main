import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "../theme";
import FadeInView from "./FadeInView";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export default function ScreenHeader({ title, subtitle, onBack }: Props) {
  return (
    <FadeInView style={styles.wrap}>
      {onBack ? (
        <Pressable style={styles.backRow} onPress={onBack} android_ripple={{ color: colors.surfaceMuted }}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  backRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backText: { color: colors.primary, marginLeft: 8, fontSize: 15, fontWeight: "600" },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: 6 },
});
