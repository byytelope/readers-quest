import { DarkTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

import Colors from "@/constants/Colors";

export default function PeerReadingLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      initialRouteName="peer-connection"
      screenOptions={{
        headerLargeTitle: true,
        headerTintColor:
          colorScheme === "dark" ? Colors.dark.tint : Colors.light.tint,
        headerTransparent: true,
        headerStyle: {
          backgroundColor:
            colorScheme === "dark" ? DarkTheme.colors.background : "white",
        },
      }}
    >
      <Stack.Screen
        name="peer-connection"
        options={{
          headerShown: true,
          title: "Find a Peer",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="reading-screen"
        options={{
          headerShown: false,
          title: "Peer Reading",
          headerLargeTitle: false,
        }}
      />
    </Stack>
  );
}
