import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type Props = {
  children: React.ReactNode;
  /** Shown as a pill (e.g. signup: "Student account") */
  roleBadge?: string;
  badgeTone?: "student" | "admin" | "instructor";
  /** Small caps line above title */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
};

const badgeStyles = {
  student: { bg: "#e0e7ff", fg: "#3730a3" },
  admin: { bg: "#ffedd5", fg: "#9a3412" },
  instructor: { bg: "#d1fae5", fg: "#065f46" },
} as const;

export default function AuthScreenShell({
  children,
  roleBadge,
  badgeTone = "student",
  eyebrow,
  title,
  subtitle,
  footer,
}: Props) {
  const tone = badgeStyles[badgeTone];
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.outer}
      keyboardShouldPersistTaps="handled"
    >
      {roleBadge ? (
        <View style={[styles.badge, { backgroundColor: tone.bg }]}>
          <Text style={[styles.badgeText, { color: tone.fg }]}>{roleBadge}</Text>
        </View>
      ) : null}
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.card}>{children}</View>
      {footer}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#f1f5f9" },
  outer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 36,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    lineHeight: 22,
    marginBottom: 22,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
});
