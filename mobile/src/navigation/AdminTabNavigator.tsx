import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import AdminCoursesListScreen from "../screens/AdminCoursesListScreen";
import AdminHomeScreen from "../screens/AdminHomeScreen";
import AdminInstructorsListScreen from "../screens/AdminInstructorsListScreen";
import AdminOfferRequestsScreen from "../screens/AdminOfferRequestsScreen";
import AdminRegisterCourseScreen from "../screens/AdminRegisterCourseScreen";
import AdminRegisterInstructorScreen from "../screens/AdminRegisterInstructorScreen";
import AdminSettingsScreen from "../screens/AdminSettingsScreen";
import type { AdminTabParamList } from "./types";

const Drawer = createDrawerNavigator<AdminTabParamList>();

function adminIcon(name: keyof AdminTabParamList) {
  const map: Record<keyof AdminTabParamList, keyof typeof Ionicons.glyphMap> = {
    AdminOverview: "person-circle-outline",
    AdminInstructors: "people-outline",
    AdminOfferRequests: "notifications-outline",
    AdminRegInstructor: "person-add-outline",
    AdminCourses: "library-outline",
    AdminRegCourse: "add-circle-outline",
    AdminSettings: "settings-outline",
  };
  return map[name];
}

export default function AdminTabNavigator() {
  return (
    <Drawer.Navigator
      defaultStatus="closed"
      screenOptions={({ route }) => ({
        drawerPosition: "left",
        drawerType: "front",
        overlayColor: "rgba(15, 23, 42, 0.28)",
        swipeEdgeWidth: 90,
        drawerActiveTintColor: "#c2410c",
        drawerInactiveTintColor: "#475569",
        drawerActiveBackgroundColor: "#ffedd5",
        drawerItemStyle: { borderRadius: 10, marginHorizontal: 8 },
        drawerLabelStyle: { marginLeft: -10, fontWeight: "600", fontSize: 14 },
        drawerStyle: {
          width: 280,
          backgroundColor: "#f8fafc",
          borderRightWidth: 1,
          borderRightColor: "#e2e8f0",
        },
        sceneStyle: { backgroundColor: "#ffffff" },
        headerTintColor: "#9a3412",
        headerTitleStyle: { fontWeight: "700" },
        headerStyle: { backgroundColor: "#f8fafc" },
        drawerIcon: ({ color, size }) => (
          <Ionicons name={adminIcon(route.name as keyof AdminTabParamList)} color={color} size={size} />
        ),
      })}
    >
      <Drawer.Screen name="AdminOverview" component={AdminHomeScreen} options={{ title: "Overview" }} />
      <Drawer.Screen name="AdminInstructors" component={AdminInstructorsListScreen} options={{ title: "Instructors" }} />
      <Drawer.Screen name="AdminOfferRequests" component={AdminOfferRequestsScreen} options={{ title: "Offer requests" }} />
      <Drawer.Screen name="AdminRegInstructor" component={AdminRegisterInstructorScreen} options={{ title: "Register instructor" }} />
      <Drawer.Screen name="AdminCourses" component={AdminCoursesListScreen} options={{ title: "Courses" }} />
      <Drawer.Screen name="AdminRegCourse" component={AdminRegisterCourseScreen} options={{ title: "Register course" }} />
      <Drawer.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ title: "Settings" }} />
    </Drawer.Navigator>
  );
}
