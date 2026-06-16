import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { PortalDrawerContent } from "../components";
import { useAuth } from "../contexts/AuthContext";
import InstructorAttendanceScreen from "../screens/InstructorAttendanceScreen";
import InstructorCoursesScreen from "../screens/InstructorCoursesScreen";
import InstructorHomeScreen from "../screens/InstructorHomeScreen";
import InstructorMarksScreen from "../screens/InstructorMarksScreen";
import InstructorSettingsScreen from "../screens/InstructorSettingsScreen";
import InstructorStudentsScreen from "../screens/InstructorStudentsScreen";
import type { InstructorTabParamList, RootStackParamList } from "./types";
import { colors } from "../theme";
import { drawerScreenOptions } from "./drawerTheme";

const Drawer = createDrawerNavigator<InstructorTabParamList>();

function instructorIcon(name: keyof InstructorTabParamList) {
  const map: Record<keyof InstructorTabParamList, keyof typeof Ionicons.glyphMap> = {
    InstructorOverview: "home-outline",
    InstructorCourses: "book-outline",
    InstructorStudents: "people-outline",
    InstructorAttendance: "calendar-outline",
    InstructorMarks: "stats-chart-outline",
    InstructorSettings: "settings-outline",
  };
  return map[name];
}

export default function InstructorTabNavigator() {
  const { instructorData, signOutInstructor } = useAuth();

  return (
    <Drawer.Navigator
      defaultStatus="closed"
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        headerTitleAlign: "center",
        ...drawerScreenOptions("instructor"),
        headerLeft: () => (
          <Pressable style={styles.headerButton} onPress={() => navigation.toggleDrawer()}>
            <Ionicons name="menu" size={24} color={colors.text} />
          </Pressable>
        ),
        drawerIcon: ({ color, size }) => (
          <Ionicons name={instructorIcon(route.name as keyof InstructorTabParamList)} color={color} size={size} />
        ),
      })}
      drawerContent={(props) => (
        <PortalDrawerContent
          {...props}
          role="instructor"
          userName={`${instructorData?.fname ?? ""} ${instructorData?.lname ?? ""}`.trim()}
          userEmail={String(instructorData?.email ?? "")}
          onSignOut={() => {
            void signOutInstructor();
            props.navigation.getParent()?.reset({ index: 0, routes: [{ name: "Home" as keyof RootStackParamList }] });
          }}
        />
      )}
    >
      <Drawer.Screen name="InstructorOverview" component={InstructorHomeScreen} options={{ title: "Dashboard" }} />
      <Drawer.Screen name="InstructorCourses" component={InstructorCoursesScreen} options={{ title: "Courses" }} />
      <Drawer.Screen name="InstructorStudents" component={InstructorStudentsScreen} options={{ title: "Students" }} />
      <Drawer.Screen name="InstructorAttendance" component={InstructorAttendanceScreen} options={{ title: "Attendance" }} />
      <Drawer.Screen name="InstructorMarks" component={InstructorMarksScreen} options={{ title: "Marks" }} />
      <Drawer.Screen name="InstructorSettings" component={InstructorSettingsScreen} options={{ title: "Settings" }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  headerButton: { marginLeft: 16 },
});
