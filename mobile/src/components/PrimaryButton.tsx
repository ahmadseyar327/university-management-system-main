import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { colors, radius } from "../theme";

type Props = Omit<PressableProps, "style"> & {
  title: string;
  loading?: boolean;
  style?: ViewStyle;
  variant?: "primary" | "danger" | "outline";
};

export default function PrimaryButton({
  title,
  loading,
  disabled,
  style,
  variant = "primary",
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  function animate(to: number) {
    Animated.spring(scale, { toValue: to, friction: 6, useNativeDriver: true }).start();
  }

  const bg =
    variant === "danger"
      ? colors.danger
      : variant === "outline"
        ? "transparent"
        : colors.primary;

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      onPressIn={(e) => {
        animate(0.97);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animate(1);
        onPressOut?.(e);
      }}
    >
      <Animated.View
        style={[
          styles.btn,
          { backgroundColor: bg, transform: [{ scale }] },
          variant === "outline" && styles.btnOutline,
          isDisabled && styles.btnDisabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === "outline" ? colors.primary : "#fff"} />
        ) : (
          <Text
            style={[
              styles.btnText,
              variant === "outline" && styles.btnTextOutline,
            ]}
          >
            {title}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 15,
    borderRadius: radius.md,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  btnDisabled: { opacity: 0.65 },
  btnText: { color: "#fff", fontWeight: "700", textAlign: "center", fontSize: 16 },
  btnTextOutline: { color: colors.primary },
});
