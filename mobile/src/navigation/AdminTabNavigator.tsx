import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { PortalDrawerContent } from "../components";
import { useAuth } from "../contexts/AuthContext";
import AdminCoursesListScreen from "../screens/AdminCoursesListScreen";
import AdminProgramsScreen from "../screens/AdminProgramsScreen";
import AdminSemesterScreen from "../screens/AdminSemesterScreen";
import AdminHomeScreen from "../screens/AdminHomeScreen";
import AdminInstructorsListScreen from "../screens/AdminInstructorsListScreen";
import AdminOfferRequestsScreen from "../screens/AdminOfferRequestsScreen";
import AdminRegisterCourseScreen from "../screens/AdminRegisterCourseScreen";
import AdminRegisterInstructorScreen from "../screens/AdminRegisterInstructorScreen";
import AdminSettingsScreen from "../screens/AdminSettingsScreen";
import type { AdminTabParamList, RootStackParamList } from "./types";
import { colors } from "../theme";
import { drawerScreenOptions } from "./drawerTheme";

const Drawer = createDrawerNavigator<AdminTabParamList>();

function adminIcon(name: keyof AdminTabParamList) {
  const map: Record<keyof AdminTabParamList, keyof typeof Ionicons.glyphMap> = {
    AdminOverview: "home-outline",
    AdminPrograms: "school-outline",
    AdminSemester: "calendar-outline",
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
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        headerTitleAlign: "center",
        ...drawerScreenOptions("admin"),
        headerLeft: () => {
          const canGoBack = navigation.canGoBack();
          return (
            <Pressable style={styles.headerButton} onPress={() => (canGoBack ? navigation.goBack() : navigation.toggleDrawer())}>
              <Ionicons name={canGoBack ? "arrow-back" : "menu"} size={24} color={colors.text} />
            </Pressable>
          );
        },
        drawerIcon: ({ color, size }) => (
          <Ionicons name={adminIcon(route.name as keyof AdminTabParamList)} color={color} size={size} />
        ),
      })}
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
    >
      <Drawer.Screen name="AdminOverview" component={AdminHomeScreen} options={{ title: "Dashboard" }} />
      <Drawer.Screen name="AdminPrograms" component={AdminProgramsScreen} options={{ title: "Programs" }} />
      <Drawer.Screen name="AdminSemester" component={AdminSemesterScreen} options={{ title: "Semester lifecycle" }} />
      <Drawer.Screen name="AdminInstructors" component={AdminInstructorsListScreen} options={{ title: "Instructors" }} />
      <Drawer.Screen name="AdminOfferRequests" component={AdminOfferRequestsScreen} options={{ title: "Offer semester courses" }} />
      <Drawer.Screen name="AdminRegInstructor" component={AdminRegisterInstructorScreen} options={{ title: "Register instructor" }} />
      <Drawer.Screen name="AdminCourses" component={AdminCoursesListScreen} options={{ title: "Program courses" }} />
      <Drawer.Screen name="AdminRegCourse" component={AdminRegisterCourseScreen} options={{ title: "Add semester course" }} />
      <Drawer.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ title: "Settings" }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  headerButton: { marginLeft: 16 },
});
