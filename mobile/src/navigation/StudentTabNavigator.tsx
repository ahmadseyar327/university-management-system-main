import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import StudentHomeScreen from "../screens/StudentHomeScreen";
import StudentMoreScreen from "../screens/StudentMoreScreen";
import type { StudentTabParamList } from "./types";

const Tab = createBottomTabNavigator<StudentTabParamList>();

export default function StudentTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#1a365d",
        tabBarInactiveTintColor: "#718096",
        headerTintColor: "#1a365d",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="StudentOverview"
        component={StudentHomeScreen}
        options={{ title: "Overview", tabBarLabel: "Overview" }}
      />
      <Tab.Screen
        name="StudentMore"
        component={StudentMoreScreen}
        options={{ title: "More", tabBarLabel: "More" }}
      />
    </Tab.Navigator>
  );
}
