import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

type Props = Omit<PressableProps, "style"> & {
  title: string;
  loading?: boolean;
  style?: ViewStyle;
};

export default function PrimaryButton({
  title,
  loading,
  disabled,
  style,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      {...rest}
      style={[styles.btn, isDisabled && styles.btnDisabled, style]}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.btnText}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#1a365d",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: "#fff", fontWeight: "700", textAlign: "center", fontSize: 16 },
});
