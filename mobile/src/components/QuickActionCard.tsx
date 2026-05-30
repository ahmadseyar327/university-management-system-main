import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "../theme";
import FadeInView from "./FadeInView";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  delay?: number;
};

export default function QuickActionCard({ icon, label, onPress, delay = 0 }: Props) {
  return (
    <FadeInView delay={delay} style={styles.wrap}>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={onPress}
      >
        <Ionicons name={icon} size={22} color={colors.primary} />
        <Text style={styles.label}>{label}</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={styles.chev} />
      </Pressable>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minWidth: "46%" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  cardPressed: { backgroundColor: colors.primarySoft, borderColor: colors.primaryMuted },
  label: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.text },
  chev: { marginLeft: "auto" },
});
