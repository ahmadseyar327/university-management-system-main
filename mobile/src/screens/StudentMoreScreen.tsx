import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { StudentTabParamList } from "../navigation/types";

type Props = BottomTabScreenProps<StudentTabParamList, "StudentMore">;

export default function StudentMoreScreen(_props: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>More</Text>
      <Text style={styles.body}>
        Add student settings, profile, or links to marks and attendance here as you port
        web pages from `client/src/pages/student/`.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 24, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", color: "#1a202c", marginBottom: 12 },
  body: { fontSize: 15, color: "#4a5568", lineHeight: 22 },
});
