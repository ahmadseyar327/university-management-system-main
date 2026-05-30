import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, roleThemes, shadow, spacing } from "../theme";

type Props = {
  header: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  variant?: "default" | "instructor";
};

export default function ActivityCard({
  header,
  children,
  isExpanded,
  onToggle,
  variant = "default",
}: Props) {
  const instructor = variant === "instructor";
  const accent = instructor ? roleThemes.instructor.accent : colors.primary;
  const accentSoft = instructor ? roleThemes.instructor.accentSoft : colors.primarySoft;

  return (
    <View style={[styles.card, shadow.soft]}>
      <Pressable
        style={[styles.header, { backgroundColor: instructor ? accentSoft : colors.surfaceMuted }]}
        onPress={onToggle}
      >
        <Text style={[styles.headerText, instructor && { color: accent }]}>{header}</Text>
        <Text style={[styles.chev, instructor && { color: accent }]}>{isExpanded ? "▾" : "▸"}</Text>
      </Pressable>
      {isExpanded ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  headerText: { fontSize: 15, fontWeight: "700", color: colors.text, flex: 1 },
  chev: { fontSize: 16, color: colors.textMuted, marginLeft: 8 },
  body: { padding: spacing.md, paddingTop: 0, borderTopWidth: 1, borderTopColor: colors.borderLight },
});
