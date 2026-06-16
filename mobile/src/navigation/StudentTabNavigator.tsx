import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { academicEndpoints } from "../api/endpoints";
import { fetchResponse } from "../api/service";
import { PortalDrawerContent } from "../components";
import { useAuth } from "../contexts/AuthContext";
import StudentAttendanceScreen from "../screens/StudentAttendanceScreen";
import StudentCoursesListScreen from "../screens/StudentCoursesListScreen";
import StudentHomeScreen from "../screens/StudentHomeScreen";
import StudentMarksScreen from "../screens/StudentMarksScreen";
import StudentRegisterCourseScreen from "../screens/StudentRegisterCourseScreen";
import StudentSettingsScreen from "../screens/StudentSettingsScreen";
import type { RootStackParamList, StudentTabParamList } from "./types";
import { colors } from "../theme";
import { drawerScreenOptions } from "./drawerTheme";
import { mongoId } from "../utils/mongoId";

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
  const studentId = mongoId(studentData);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const loadEnrollment = useCallback(async () => {
    if (!studentId) {
      setIsEnrolled(false);
      return;
    }
    const res = await fetchResponse(academicEndpoints.getStudentRecord(studentId), 0, null);
    setIsEnrolled(Boolean(res?.success));
  }, [studentId]);

  useEffect(() => {
    void loadEnrollment();
  }, [loadEnrollment]);

  return (
    <Drawer.Navigator
      defaultStatus="closed"
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        headerTitleAlign: "center",
        ...drawerScreenOptions("student"),
        headerLeft: () => (
          <Pressable style={styles.headerButton} onPress={() => navigation.toggleDrawer()}>
            <Ionicons name="menu" size={24} color={colors.text} />
          </Pressable>
        ),
        drawerIcon: ({ color, size }) => (
          <Ionicons name={studentIcon(route.name as keyof StudentTabParamList)} color={color} size={size} />
        ),
      })}
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
    >
      <Drawer.Screen
        name="StudentOverview"
        component={StudentHomeScreen}
        options={{ title: "Dashboard" }}
        listeners={{
          focus: () => {
            void loadEnrollment();
          },
        }}
      />
      <Drawer.Screen name="StudentCourses" component={StudentCoursesListScreen} options={{ title: "My courses" }} />
      <Drawer.Screen
        name="StudentRegister"
        component={StudentRegisterCourseScreen}
        options={{
          title: "Enroll in program",
          drawerItemStyle: isEnrolled ? { display: "none" } : undefined,
        }}
        listeners={{
          focus: () => {
            void loadEnrollment();
          },
        }}
      />
      <Drawer.Screen name="StudentMarks" component={StudentMarksScreen} options={{ title: "Marks" }} />
      <Drawer.Screen name="StudentAttendance" component={StudentAttendanceScreen} options={{ title: "Attendance" }} />
      <Drawer.Screen name="StudentSettings" component={StudentSettingsScreen} options={{ title: "Settings" }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  headerButton: { marginLeft: 16 },
});
