import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const winW = Dimensions.get("window").width;

type Props = {
  /** When non-null, panel is shown for this item. Parent clears after `onClosed`. */
  open: boolean;
  onClosed: () => void;
  children: React.ReactNode;
};

/**
 * Slides a panel in from the right over a dimmed backdrop (does not resize the list behind it).
 */
export default function SlideOverDetail({ open, onClosed, children }: Props) {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(winW)).current;
  const backdropOp = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);

  useEffect(() => {
    if (!open) {
      translateX.setValue(winW);
      backdropOp.setValue(0);
      closingRef.current = false;
      return;
    }
    translateX.setValue(winW);
    backdropOp.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOp, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        friction: 9,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, [open, translateX, backdropOp]);

  function runClose() {
    if (closingRef.current) return;
    closingRef.current = true;
    Animated.parallel([
      Animated.timing(backdropOp, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: winW,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      closingRef.current = false;
      if (finished) onClosed();
    });
  }

  if (!open) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={runClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdropPress} onPress={runClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOp.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ]}
          />
        </Pressable>
        <Animated.View
          style={[
            styles.panel,
            {
              transform: [{ translateX }],
              paddingTop: Math.max(insets.top, 12) + 8,
              paddingBottom: Math.max(insets.bottom, 12) + 8,
            },
          ]}
        >
          <View style={styles.panelHeader}>
            <Text style={styles.panelHeaderTxt}>Details</Text>
            <Pressable
              onPress={runClose}
              hitSlop={12}
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
              accessibilityLabel="Close details"
            >
              <Ionicons name="close-circle" size={30} color="#64748b" />
            </Pressable>
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollInner}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdropPress: { ...StyleSheet.absoluteFillObject },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },
  panel: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: Math.min(winW * 0.92, 420),
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderLeftWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 24,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginBottom: 8,
  },
  panelHeaderTxt: { fontSize: 14, fontWeight: "700", color: "#64748b", letterSpacing: 0.5 },
  closeBtn: { padding: 4 },
  scroll: { flex: 1 },
  scrollInner: { paddingHorizontal: 20, paddingBottom: 24 },
});
