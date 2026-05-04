import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import AdminHomeScreen from "../screens/AdminHomeScreen";
import AdminLoginScreen from "../screens/AdminLoginScreen";
import AdminSignupScreen from "../screens/AdminSignupScreen";
import HomeScreen from "../screens/HomeScreen";
import InstructorHomeScreen from "../screens/InstructorHomeScreen";
import InstructorLoginScreen from "../screens/InstructorLoginScreen";
import StudentLoginScreen from "../screens/StudentLoginScreen";
import StudentSignupScreen from "../screens/StudentSignupScreen";
import StudentTabNavigator from "./StudentTabNavigator";
import type { RootStackParamList } from "./types";

const Stack = createStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#fff",
    primary: "#1a365d",
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerTintColor: "#1a365d",
          headerTitleStyle: { fontWeight: "600" },
          cardStyle: { backgroundColor: "#fff" },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "UMS" }} />
        <Stack.Screen name="StudentLogin" component={StudentLoginScreen} options={{ title: "Student" }} />
        <Stack.Screen name="StudentSignup" component={StudentSignupScreen} options={{ title: "Student sign up" }} />
        <Stack.Screen
          name="InstructorLogin"
          component={InstructorLoginScreen}
          options={{ title: "Instructor" }}
        />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ title: "Admin" }} />
        <Stack.Screen name="AdminSignup" component={AdminSignupScreen} options={{ title: "Admin sign up" }} />
        <Stack.Screen
          name="StudentTabs"
          component={StudentTabNavigator}
          options={{ title: "Student", headerShown: false }}
        />
        <Stack.Screen name="InstructorHome" component={InstructorHomeScreen} options={{ title: "Instructor" }} />
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: "Admin" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
