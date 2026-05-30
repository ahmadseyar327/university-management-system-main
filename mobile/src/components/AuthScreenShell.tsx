import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius, shadow, spacing, typography } from "../theme";
import AmbientBackground from "./AmbientBackground";
import FadeInView from "./FadeInView";

type Props = {
  children: React.ReactNode;
  roleBadge?: string;
  badgeTone?: "student" | "admin" | "instructor";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
};

const badgeStyles = {
  student: { bg: colors.primarySoft, fg: colors.primary },
  admin: { bg: "#ffedd5", fg: colors.admin },
  instructor: { bg: "#d1fae5", fg: colors.instructor },
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
    <View style={styles.root}>
      <AmbientBackground variant="auth" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.outer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FadeInView>
          {roleBadge ? (
            <View style={[styles.badge, { backgroundColor: tone.bg }]}>
              <Text style={[styles.badgeText, { color: tone.fg }]}>{roleBadge}</Text>
            </View>
          ) : null}
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </FadeInView>
        <FadeInView delay={120} style={styles.card}>
          {children}
        </FadeInView>
        {footer ? <FadeInView delay={200}>{footer}</FadeInView> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  outer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 40,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  badgeText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
  eyebrow: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: { ...typography.hero, fontSize: 30, color: colors.text, marginBottom: 8 },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
});
