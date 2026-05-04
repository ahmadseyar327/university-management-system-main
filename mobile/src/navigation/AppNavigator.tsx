import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import AdminLoginScreen from "../screens/AdminLoginScreen";
import AdminSignupScreen from "../screens/AdminSignupScreen";
import HomeScreen from "../screens/HomeScreen";
import InstructorLoginScreen from "../screens/InstructorLoginScreen";
import StudentLoginScreen from "../screens/StudentLoginScreen";
import StudentSignupScreen from "../screens/StudentSignupScreen";
import AdminTabNavigator from "./AdminTabNavigator";
import InstructorTabNavigator from "./InstructorTabNavigator";
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
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "University MIS" }} />
        <Stack.Screen name="StudentLogin" component={StudentLoginScreen} options={{ title: "Sign in" }} />
        <Stack.Screen name="StudentSignup" component={StudentSignupScreen} options={{ title: "Create account" }} />
        <Stack.Screen
          name="InstructorLogin"
          component={InstructorLoginScreen}
          options={{ title: "Sign in" }}
        />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ title: "Sign in" }} />
        <Stack.Screen name="AdminSignup" component={AdminSignupScreen} options={{ title: "Create account" }} />
        <Stack.Screen
          name="StudentTabs"
          component={StudentTabNavigator}
          options={{ title: "Student", headerShown: false }}
        />
        <Stack.Screen
          name="InstructorTabs"
          component={InstructorTabNavigator}
          options={{ title: "Instructor", headerShown: false }}
        />
        <Stack.Screen name="AdminTabs" component={AdminTabNavigator} options={{ title: "Admin", headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
