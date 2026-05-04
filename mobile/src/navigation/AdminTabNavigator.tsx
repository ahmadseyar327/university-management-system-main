import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import AdminCoursesListScreen from "../screens/AdminCoursesListScreen";
import AdminHomeScreen from "../screens/AdminHomeScreen";
import AdminInstructorsListScreen from "../screens/AdminInstructorsListScreen";
import AdminRegisterCourseScreen from "../screens/AdminRegisterCourseScreen";
import AdminRegisterInstructorScreen from "../screens/AdminRegisterInstructorScreen";
import AdminSettingsScreen from "../screens/AdminSettingsScreen";
import type { AdminTabParamList } from "./types";

const Tab = createBottomTabNavigator<AdminTabParamList>();

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#1a365d",
        tabBarInactiveTintColor: "#718096",
        headerTintColor: "#1a365d",
        headerTitleStyle: { fontWeight: "600" },
        tabBarLabelStyle: { fontSize: 9 },
      }}
    >
      <Tab.Screen name="AdminOverview" component={AdminHomeScreen} options={{ title: "Me", tabBarLabel: "Me" }} />
      <Tab.Screen
        name="AdminInstructors"
        component={AdminInstructorsListScreen}
        options={{ title: "Instructors", tabBarLabel: "Staff" }}
      />
      <Tab.Screen
        name="AdminRegInstructor"
        component={AdminRegisterInstructorScreen}
        options={{ title: "Add instructor", tabBarLabel: "+Inst" }}
      />
      <Tab.Screen name="AdminCourses" component={AdminCoursesListScreen} options={{ title: "Courses", tabBarLabel: "Courses" }} />
      <Tab.Screen
        name="AdminRegCourse"
        component={AdminRegisterCourseScreen}
        options={{ title: "Add course", tabBarLabel: "+Course" }}
      />
      <Tab.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ title: "Settings", tabBarLabel: "Edit" }} />
    </Tab.Navigator>
  );
}
