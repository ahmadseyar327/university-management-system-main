import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import InstructorAttendanceScreen from "../screens/InstructorAttendanceScreen";
import InstructorCoursesScreen from "../screens/InstructorCoursesScreen";
import InstructorHomeScreen from "../screens/InstructorHomeScreen";
import InstructorMarksScreen from "../screens/InstructorMarksScreen";
import InstructorSettingsScreen from "../screens/InstructorSettingsScreen";
import InstructorStudentsScreen from "../screens/InstructorStudentsScreen";
import type { InstructorTabParamList } from "./types";

const Drawer = createDrawerNavigator<InstructorTabParamList>();

function instructorIcon(name: keyof InstructorTabParamList) {
  const map: Record<keyof InstructorTabParamList, keyof typeof Ionicons.glyphMap> = {
    InstructorOverview: "person-circle-outline",
    InstructorCourses: "book-outline",
    InstructorStudents: "people-outline",
    InstructorAttendance: "calendar-outline",
    InstructorMarks: "stats-chart-outline",
    InstructorSettings: "settings-outline",
  };
  return map[name];
}

export default function InstructorTabNavigator() {
  return (
    <Drawer.Navigator
      defaultStatus="closed"
      screenOptions={({ route }) => ({
        drawerPosition: "left",
        drawerType: "front",
        overlayColor: "rgba(15, 23, 42, 0.28)",
        swipeEdgeWidth: 90,
        drawerActiveTintColor: "#047857",
        drawerInactiveTintColor: "#475569",
        drawerActiveBackgroundColor: "#d1fae5",
        drawerItemStyle: { borderRadius: 10, marginHorizontal: 8 },
        drawerLabelStyle: { marginLeft: -10, fontWeight: "600", fontSize: 14 },
        drawerStyle: { width: 280, backgroundColor: "#f8fafc", borderRightWidth: 1, borderRightColor: "#e2e8f0" },
        sceneStyle: { backgroundColor: "#ffffff" },
        headerTintColor: "#065f46",
        headerTitleStyle: { fontWeight: "700" },
        headerStyle: { backgroundColor: "#f8fafc" },
        drawerIcon: ({ color, size }) => (
          <Ionicons name={instructorIcon(route.name as keyof InstructorTabParamList)} color={color} size={size} />
        ),
      })}
    >
      <Drawer.Screen name="InstructorOverview" component={InstructorHomeScreen} options={{ title: "Overview" }} />
      <Drawer.Screen name="InstructorCourses" component={InstructorCoursesScreen} options={{ title: "Courses" }} />
      <Drawer.Screen name="InstructorStudents" component={InstructorStudentsScreen} options={{ title: "Students" }} />
      <Drawer.Screen name="InstructorAttendance" component={InstructorAttendanceScreen} options={{ title: "Attendance" }} />
      <Drawer.Screen name="InstructorMarks" component={InstructorMarksScreen} options={{ title: "Marks" }} />
      <Drawer.Screen name="InstructorSettings" component={InstructorSettingsScreen} options={{ title: "Settings" }} />
    </Drawer.Navigator>
  );
}
