import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, shadow, spacing } from "../theme";
import FadeInView from "./FadeInView";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  delay?: number;
};

export default function StatCard({ icon, label, value, delay = 0 }: Props) {
  return (
    <FadeInView delay={delay} style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minWidth: "46%" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 108,
    ...shadow.soft,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: { fontSize: 14, fontWeight: "700", color: colors.text, lineHeight: 20 },
});
