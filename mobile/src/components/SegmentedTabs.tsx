import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

type Tab = { key: string; label: string };

type Props = {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
  accent?: string;
};

export default function SegmentedTabs({ tabs, active, onChange, accent = colors.primary }: Props) {
  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => {
        const on = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            style={[styles.tab, on && { backgroundColor: accent, borderColor: accent }]}
            onPress={() => onChange(tab.key)}
          >
            <Text style={[styles.txt, on && styles.txtOn]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  txt: { fontWeight: "600", fontSize: 13, color: colors.textSecondary },
  txtOn: { color: colors.textInverse, fontWeight: "700" },
});
