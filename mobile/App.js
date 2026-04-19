import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator } from "react-native";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { COLORS } from "./src/utils/theme";

import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen  from "./src/screens/HomeScreen";
import {
  ResultsScreen, SubjectsScreen, TimetableScreen,
  AnnouncementsScreen, ProfileScreen
} from "./src/screens/Screens";

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ICON = {
  Home:    { active:"🏠", inactive:"🏡" },
  Results: { active:"📊", inactive:"📈" },
  Subjects:{ active:"📚", inactive:"📖" },
  Profile: { active:"👤", inactive:"🙍" },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarIcon: ({ focused, size }) => (
          <Text style={{ fontSize: 20 }}>{focused ? ICON[route.name]?.active : ICON[route.name]?.inactive}</Text>
        ),
      })}
    >
      <Tab.Screen name="Home"    component={HomeStack}    options={{ title: "Home" }} />
      <Tab.Screen name="Results" component={ResultsScreen} />
      <Tab.Screen name="Subjects" component={SubjectsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Timetable" component={TimetableScreen}
        options={{ headerShown: true, title: "Timetable", headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: "#fff", headerTitleStyle: { fontWeight: "800" } }} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen}
        options={{ headerShown: true, title: "Announcements", headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: "#fff", headerTitleStyle: { fontWeight: "800" } }} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.primary }}>
        <Text style={{ fontSize: 50, marginBottom: 20 }}>🎓</Text>
        <ActivityIndicator color="#fff" size="large" />
        <Text style={{ color: "#fff", marginTop: 16, fontWeight: "700", fontSize: 14 }}>SmartSchool TZ</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
