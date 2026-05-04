import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import StudentAttendanceScreen from "../screens/StudentAttendanceScreen";
import StudentCoursesListScreen from "../screens/StudentCoursesListScreen";
import StudentHomeScreen from "../screens/StudentHomeScreen";
import StudentMarksScreen from "../screens/StudentMarksScreen";
import StudentRegisterCourseScreen from "../screens/StudentRegisterCourseScreen";
import StudentSettingsScreen from "../screens/StudentSettingsScreen";
import type { StudentTabParamList } from "./types";

const Drawer = createDrawerNavigator<StudentTabParamList>();

function studentIcon(name: keyof StudentTabParamList) {
  const map: Record<keyof StudentTabParamList, keyof typeof Ionicons.glyphMap> = {
    StudentOverview: "person-circle-outline",
    StudentCourses: "library-outline",
    StudentRegister: "add-circle-outline",
    StudentMarks: "bar-chart-outline",
    StudentAttendance: "calendar-outline",
    StudentSettings: "settings-outline",
  };
  return map[name];
}

export default function StudentTabNavigator() {
  return (
    <Drawer.Navigator
      defaultStatus="closed"
      screenOptions={({ route }) => ({
        drawerPosition: "left",
        drawerType: "front",
        overlayColor: "rgba(15, 23, 42, 0.28)",
        swipeEdgeWidth: 90,
        drawerActiveTintColor: "#1d4ed8",
        drawerInactiveTintColor: "#475569",
        drawerActiveBackgroundColor: "#dbeafe",
        drawerItemStyle: { borderRadius: 10, marginHorizontal: 8 },
        drawerLabelStyle: { marginLeft: -10, fontWeight: "600", fontSize: 14 },
        drawerStyle: { width: 280, backgroundColor: "#f8fafc", borderRightWidth: 1, borderRightColor: "#e2e8f0" },
        sceneStyle: { backgroundColor: "#ffffff" },
        headerTintColor: "#1a365d",
        headerTitleStyle: { fontWeight: "700" },
        headerStyle: { backgroundColor: "#f8fafc" },
        drawerIcon: ({ color, size }) => (
          <Ionicons name={studentIcon(route.name as keyof StudentTabParamList)} color={color} size={size} />
        ),
      })}
    >
      <Drawer.Screen name="StudentOverview" component={StudentHomeScreen} options={{ title: "Profile" }} />
      <Drawer.Screen name="StudentCourses" component={StudentCoursesListScreen} options={{ title: "My courses" }} />
      <Drawer.Screen name="StudentRegister" component={StudentRegisterCourseScreen} options={{ title: "Register" }} />
      <Drawer.Screen name="StudentMarks" component={StudentMarksScreen} options={{ title: "Marks" }} />
      <Drawer.Screen name="StudentAttendance" component={StudentAttendanceScreen} options={{ title: "Attendance" }} />
      <Drawer.Screen name="StudentSettings" component={StudentSettingsScreen} options={{ title: "Settings" }} />
    </Drawer.Navigator>
  );
}
