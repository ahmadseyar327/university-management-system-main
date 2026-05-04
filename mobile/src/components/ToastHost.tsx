import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, DeviceEventEmitter, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TOAST_EVENT, type ToastPayload, toastErrorObject, toastSuccessObject } from "../utils/toasts";

export default function ToastHost() {
  const insets = useSafeAreaInsets();
  const [payload, setPayload] = useState<ToastPayload | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-24)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(TOAST_EVENT, (p: ToastPayload) => {
      setPayload(p);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!payload) return;

    if (hideTimer.current) clearTimeout(hideTimer.current);

    opacity.setValue(0);
    translateY.setValue(-24);
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, friction: 8, tension: 90, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    const duration =
      payload.type === "success" ? toastSuccessObject.autoClose : toastErrorObject.autoClose;
    hideTimer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -28, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setPayload(null);
      });
    }, duration);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [payload, opacity, translateY]);

  if (!payload) return null;

  const isOk = payload.type === "success";
  const bg = isOk ? "#ecfdf5" : "#fef2f2";
  const border = isOk ? "#6ee7b7" : "#fecaca";
  const fg = isOk ? "#065f46" : "#991b1b";
  const icon = isOk ? ("checkmark-circle" as const) : ("alert-circle" as const);
  const iconColor = isOk ? "#059669" : "#dc2626";

  return (
    <View pointerEvents="none" style={styles.host}>
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor: bg,
            borderColor: border,
            marginTop: insets.top + (Platform.OS === "web" ? 12 : 8),
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <Ionicons name={icon} size={22} color={iconColor} style={styles.icon} />
        <Text style={[styles.text, { color: fg }]}>{payload.message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 420,
    width: "92%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  icon: { marginRight: 10 },
  text: { flex: 1, fontSize: 15, fontWeight: "600", lineHeight: 20 },
});
