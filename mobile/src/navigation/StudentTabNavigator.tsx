import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import StudentAttendanceScreen from "../screens/StudentAttendanceScreen";
import StudentCoursesListScreen from "../screens/StudentCoursesListScreen";
import StudentHomeScreen from "../screens/StudentHomeScreen";
import StudentMarksScreen from "../screens/StudentMarksScreen";
import StudentRegisterCourseScreen from "../screens/StudentRegisterCourseScreen";
import StudentSettingsScreen from "../screens/StudentSettingsScreen";
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
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
      <Tab.Screen
        name="StudentOverview"
        component={StudentHomeScreen}
        options={{ title: "Profile", tabBarLabel: "Me" }}
      />
      <Tab.Screen
        name="StudentCourses"
        component={StudentCoursesListScreen}
        options={{ title: "My courses", tabBarLabel: "Courses" }}
      />
      <Tab.Screen
        name="StudentRegister"
        component={StudentRegisterCourseScreen}
        options={{ title: "Register", tabBarLabel: "Join" }}
      />
      <Tab.Screen
        name="StudentMarks"
        component={StudentMarksScreen}
        options={{ title: "Marks", tabBarLabel: "Marks" }}
      />
      <Tab.Screen
        name="StudentAttendance"
        component={StudentAttendanceScreen}
        options={{ title: "Attendance", tabBarLabel: "Attend" }}
      />
      <Tab.Screen
        name="StudentSettings"
        component={StudentSettingsScreen}
        options={{ title: "Settings", tabBarLabel: "Edit" }}
      />
    </Tab.Navigator>
  );
}
