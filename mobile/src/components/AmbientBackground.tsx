import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

type Props = {
  variant?: "home" | "auth";
};

function useFloatLoop(duration: number, distance: number) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [distance, duration, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -distance],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.28, 0.5],
  });

  return { translateY, opacity };
}

export default function AmbientBackground({ variant = "auth" }: Props) {
  const slow = useFloatLoop(8500, 16);
  const medium = useFloatLoop(6200, 12);
  const fast = useFloatLoop(5000, 10);

  const palette =
    variant === "home"
      ? { one: "#bfdbfe", two: "#dbeafe", three: "#e0e7ff" }
      : { one: "#dbeafe", two: "#e0e7ff", three: "#ede9fe" };

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View
        style={[
          styles.blob,
          styles.blobOne,
          { backgroundColor: palette.one, opacity: slow.opacity, transform: [{ translateY: slow.translateY }] },
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          styles.blobTwo,
          { backgroundColor: palette.two, opacity: medium.opacity, transform: [{ translateY: medium.translateY }] },
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          styles.blobThree,
          { backgroundColor: palette.three, opacity: fast.opacity, transform: [{ translateY: fast.translateY }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
  },
  blobOne: {
    width: 220,
    height: 220,
    top: -56,
    right: -72,
  },
  blobTwo: {
    width: 180,
    height: 180,
    top: "32%",
    left: -68,
  },
  blobThree: {
    width: 240,
    height: 240,
    bottom: -110,
    right: "12%",
  },
});
