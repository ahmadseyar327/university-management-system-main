import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import { PortalDrawerContent } from "../components";
import { useAuth } from "../contexts/AuthContext";
import StudentAttendanceScreen from "../screens/StudentAttendanceScreen";
import StudentCoursesListScreen from "../screens/StudentCoursesListScreen";
import StudentHomeScreen from "../screens/StudentHomeScreen";
import StudentMarksScreen from "../screens/StudentMarksScreen";
import StudentRegisterCourseScreen from "../screens/StudentRegisterCourseScreen";
import StudentSettingsScreen from "../screens/StudentSettingsScreen";
import type { RootStackParamList, StudentTabParamList } from "./types";
import { drawerScreenOptions } from "./drawerTheme";

const Drawer = createDrawerNavigator<StudentTabParamList>();

function studentIcon(name: keyof StudentTabParamList) {
  const map: Record<keyof StudentTabParamList, keyof typeof Ionicons.glyphMap> = {
    StudentOverview: "home-outline",
    StudentCourses: "library-outline",
    StudentRegister: "add-circle-outline",
    StudentMarks: "bar-chart-outline",
    StudentAttendance: "calendar-outline",
    StudentSettings: "settings-outline",
  };
  return map[name];
}

export default function StudentTabNavigator() {
  const { studentData, signOutStudent } = useAuth();

  return (
    <Drawer.Navigator
      defaultStatus="closed"
      drawerContent={(props) => (
        <PortalDrawerContent
          {...props}
          role="student"
          userName={`${studentData?.fname ?? ""} ${studentData?.lname ?? ""}`.trim()}
          userEmail={String(studentData?.email ?? "")}
          onSignOut={() => {
            void signOutStudent();
            props.navigation.getParent()?.reset({ index: 0, routes: [{ name: "Home" as keyof RootStackParamList }] });
          }}
        />
      )}
      screenOptions={({ route }) => ({
        ...drawerScreenOptions("student"),
        drawerIcon: ({ color, size }) => (
          <Ionicons name={studentIcon(route.name as keyof StudentTabParamList)} color={color} size={size} />
        ),
      })}
    >
      <Drawer.Screen name="StudentOverview" component={StudentHomeScreen} options={{ title: "Dashboard" }} />
      <Drawer.Screen name="StudentCourses" component={StudentCoursesListScreen} options={{ title: "My courses" }} />
      <Drawer.Screen name="StudentRegister" component={StudentRegisterCourseScreen} options={{ title: "Register" }} />
      <Drawer.Screen name="StudentMarks" component={StudentMarksScreen} options={{ title: "Marks" }} />
      <Drawer.Screen name="StudentAttendance" component={StudentAttendanceScreen} options={{ title: "Attendance" }} />
      <Drawer.Screen name="StudentSettings" component={StudentSettingsScreen} options={{ title: "Settings" }} />
    </Drawer.Navigator>
  );
}
