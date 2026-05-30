import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import React from "react";
import { colors } from "../theme";
import AdminLoginScreen from "../screens/AdminLoginScreen";
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
    background: colors.background,
    primary: colors.primary,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: "700", fontSize: 17 },
          headerStyle: {
            backgroundColor: colors.surface,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
          cardStyle: { backgroundColor: colors.background },
          ...TransitionPresets.SlideFromRightIOS,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="StudentLogin" component={StudentLoginScreen} options={{ title: "Sign in" }} />
        <Stack.Screen name="StudentSignup" component={StudentSignupScreen} options={{ title: "Create account" }} />
        <Stack.Screen name="InstructorLogin" component={InstructorLoginScreen} options={{ title: "Sign in" }} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ title: "Sign in" }} />
        <Stack.Screen name="StudentTabs" component={StudentTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="InstructorTabs" component={InstructorTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="AdminTabs" component={AdminTabNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
