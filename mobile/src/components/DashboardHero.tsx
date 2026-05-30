import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, shadow, spacing } from "../theme";
import FadeInView from "./FadeInView";

type Props = {
  name: string;
  subtitle: string;
  initials: string;
  accentColor?: string;
};

export default function DashboardHero({ name, subtitle, initials, accentColor = colors.primary }: Props) {
  return (
    <FadeInView style={styles.wrap}>
      <View style={styles.card}>
        <View style={[styles.avatar, { backgroundColor: accentColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarText: { color: colors.textInverse, fontSize: 18, fontWeight: "800" },
  body: { flex: 1 },
  greeting: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  name: { fontSize: 22, fontWeight: "800", color: colors.text, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
});
