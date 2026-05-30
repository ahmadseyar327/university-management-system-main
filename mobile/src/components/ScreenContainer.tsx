import React from "react";
import { ScrollView, ScrollViewProps, StyleSheet, View, ViewStyle } from "react-native";
import { colors, spacing } from "../theme";

type Props = ScrollViewProps & {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
};

export default function ScreenContainer({
  children,
  scroll = true,
  style,
  contentContainerStyle,
  ...rest
}: Props) {
  if (!scroll) {
    return <View style={[styles.root, style]}>{children}</View>;
  }

  return (
    <ScrollView
      style={[styles.root, style]}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 48 },
});
