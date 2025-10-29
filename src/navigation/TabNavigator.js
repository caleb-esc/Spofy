import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import LoginScreen from "../screens/LoginScreen";
import { Text } from "react-native";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#121212", borderTopColor: "#121212" },
        tabBarActiveTintColor: "#1DB954",
        tabBarInactiveTintColor: "#b3b3b3",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: ({ color }) => <Text style={{ color }}>Home</Text> }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarLabel: ({ color }) => <Text style={{ color }}>Search</Text> }}
      />
      <Tab.Screen
        name="Account"
        component={LoginScreen}
        options={{ tabBarLabel: ({ color }) => <Text style={{ color }}>Account</Text> }}
      />
    </Tab.Navigator>
  );
}