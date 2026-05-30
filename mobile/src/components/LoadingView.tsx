import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export default function LoadingView({ message = "Loading…" }: { message?: string }) {
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.6, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.wrap}>
      <Animated.View style={{ opacity: pulse }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Animated.View>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  text: { marginTop: 14, fontSize: 14, color: colors.textSecondary, fontWeight: "500" },
});
