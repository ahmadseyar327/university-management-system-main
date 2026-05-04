import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import InstructorAttendanceScreen from "../screens/InstructorAttendanceScreen";
import InstructorCoursesScreen from "../screens/InstructorCoursesScreen";
import InstructorHomeScreen from "../screens/InstructorHomeScreen";
import InstructorMarksScreen from "../screens/InstructorMarksScreen";
import InstructorSettingsScreen from "../screens/InstructorSettingsScreen";
import InstructorStudentsScreen from "../screens/InstructorStudentsScreen";
import type { InstructorTabParamList } from "./types";

const Tab = createBottomTabNavigator<InstructorTabParamList>();

export default function InstructorTabNavigator() {
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
      <Tab.Screen name="InstructorOverview" component={InstructorHomeScreen} options={{ title: "Me", tabBarLabel: "Me" }} />
      <Tab.Screen name="InstructorCourses" component={InstructorCoursesScreen} options={{ title: "Courses", tabBarLabel: "Courses" }} />
      <Tab.Screen name="InstructorStudents" component={InstructorStudentsScreen} options={{ title: "Students", tabBarLabel: "Class" }} />
      <Tab.Screen
        name="InstructorAttendance"
        component={InstructorAttendanceScreen}
        options={{ title: "Attendance", tabBarLabel: "Attend" }}
      />
      <Tab.Screen name="InstructorMarks" component={InstructorMarksScreen} options={{ title: "Marks", tabBarLabel: "Marks" }} />
      <Tab.Screen name="InstructorSettings" component={InstructorSettingsScreen} options={{ title: "Settings", tabBarLabel: "Edit" }} />
    </Tab.Navigator>
  );
}
