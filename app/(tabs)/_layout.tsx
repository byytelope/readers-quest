import React from "react";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "blue",
        headerShown: false,
      }}
    >
      <Tabs.Screen name="scene01" options={{ title: "Scene 1" }} />
      <Tabs.Screen name="scene02" options={{ title: "Scene 2" }} />
    </Tabs>
  );
}
