import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

type Props = {
  activityNumber: unknown;
  weightage: unknown;
  totalMarks: unknown;
  obtained: unknown;
  delay?: number;
};

export default function MarksResultRow({
  activityNumber,
  weightage,
  totalMarks,
  obtained,
}: Props) {
  const got = Number(obtained ?? 0);
  const tot = Number(totalMarks ?? 0);
  const pct = tot > 0 ? Math.min(100, Math.round((got / tot) * 100)) : 0;

  return (
    <View style={styles.row}>
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>#{String(activityNumber ?? "")}</Text>
      </View>
      <View style={styles.mid}>
        <Text style={styles.meta}>
          Weight {String(weightage ?? "—")}% · Total {String(totalMarks ?? "—")}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>
      <View style={styles.scoreCol}>
        <Text style={styles.score}>{String(obtained ?? "—")}</Text>
        <Text style={styles.scoreSub}>/{String(totalMarks ?? "—")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 10,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTxt: { fontWeight: "800", color: colors.primary, fontSize: 13 },
  mid: { flex: 1 },
  meta: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  track: {
    height: 5,
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  scoreCol: { alignItems: "flex-end" },
  score: { fontSize: 18, fontWeight: "800", color: colors.text },
  scoreSub: { fontSize: 11, color: colors.textMuted },
});
