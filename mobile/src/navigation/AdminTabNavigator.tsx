import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import { PortalDrawerContent } from "../components";
import { useAuth } from "../contexts/AuthContext";
import AdminCoursesListScreen from "../screens/AdminCoursesListScreen";
import AdminHomeScreen from "../screens/AdminHomeScreen";
import AdminInstructorsListScreen from "../screens/AdminInstructorsListScreen";
import AdminOfferRequestsScreen from "../screens/AdminOfferRequestsScreen";
import AdminRegisterCourseScreen from "../screens/AdminRegisterCourseScreen";
import AdminRegisterInstructorScreen from "../screens/AdminRegisterInstructorScreen";
import AdminSettingsScreen from "../screens/AdminSettingsScreen";
import type { AdminTabParamList, RootStackParamList } from "./types";
import { drawerScreenOptions } from "./drawerTheme";

const Drawer = createDrawerNavigator<AdminTabParamList>();

function adminIcon(name: keyof AdminTabParamList) {
  const map: Record<keyof AdminTabParamList, keyof typeof Ionicons.glyphMap> = {
    AdminOverview: "home-outline",
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
  const { adminData, signOutAdmin } = useAuth();

  return (
    <Drawer.Navigator
      defaultStatus="closed"
      drawerContent={(props) => (
        <PortalDrawerContent
          {...props}
          role="admin"
          userName={`${adminData?.fname ?? ""} ${adminData?.lname ?? ""}`.trim()}
          userEmail={String(adminData?.email ?? "")}
          onSignOut={() => {
            void signOutAdmin();
            props.navigation.getParent()?.reset({ index: 0, routes: [{ name: "Home" as keyof RootStackParamList }] });
          }}
        />
      )}
      screenOptions={({ route }) => ({
        ...drawerScreenOptions("admin"),
        drawerIcon: ({ color, size }) => (
          <Ionicons name={adminIcon(route.name as keyof AdminTabParamList)} color={color} size={size} />
        ),
      })}
    >
      <Drawer.Screen name="AdminOverview" component={AdminHomeScreen} options={{ title: "Dashboard" }} />
      <Drawer.Screen name="AdminInstructors" component={AdminInstructorsListScreen} options={{ title: "Instructors" }} />
      <Drawer.Screen name="AdminOfferRequests" component={AdminOfferRequestsScreen} options={{ title: "Offer courses" }} />
      <Drawer.Screen name="AdminRegInstructor" component={AdminRegisterInstructorScreen} options={{ title: "Register instructor" }} />
      <Drawer.Screen name="AdminCourses" component={AdminCoursesListScreen} options={{ title: "Courses" }} />
      <Drawer.Screen name="AdminRegCourse" component={AdminRegisterCourseScreen} options={{ title: "Register course" }} />
      <Drawer.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ title: "Settings" }} />
    </Drawer.Navigator>
  );
}
