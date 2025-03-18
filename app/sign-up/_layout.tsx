import { DarkTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

import Colors from "@/constants/Colors";

export default function SignUpLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
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
        name="index"
        options={{
          headerTitle: "Sign Up",
        }}
      />
      <Stack.Screen
        name="child-info"
        options={{ headerTitle: "Child Info", headerBackVisible: false }}
      />
    </Stack>
  );
}
