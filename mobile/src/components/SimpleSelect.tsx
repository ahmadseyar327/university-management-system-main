import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius, shadow, spacing } from "../theme";

export type SelectOption = { label: string; value: string };

type Props = {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SimpleSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select…",
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value)?.label;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={selected ? styles.fieldText : styles.placeholder}>
          {selected ?? placeholder}
        </Text>
        <Text style={styles.chev}>▾</Text>
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <View style={[styles.sheet, shadow.card]}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  fieldText: { fontSize: 16, color: colors.text, flex: 1 },
  placeholder: { fontSize: 16, color: colors.textMuted, flex: 1 },
  chev: { fontSize: 14, color: colors.textSecondary },
  modalRoot: { flex: 1, justifyContent: "center" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    marginHorizontal: spacing.md,
    maxHeight: "70%",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    color: colors.text,
  },
  option: { paddingHorizontal: spacing.md, paddingVertical: 14 },
  optionText: { fontSize: 16, color: colors.text },
});
