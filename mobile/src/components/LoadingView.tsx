import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function LoadingView() {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color="#1a365d" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 40, alignItems: "center", justifyContent: "center" },
});
