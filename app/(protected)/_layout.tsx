import { DarkTheme } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import Colors from "@/constants/Colors";
import { useSupabase } from "@/utils/supabaseContext";

export default function ProtectedLayout() {
  const { session, initialized } = useSupabase();
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !session) {
      router.replace("/");
    }
  }, [session, initialized, router]);

  return (
    <Stack
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
        headerTransparent: false,
        headerTintColor:
          colorScheme === "dark" ? Colors.dark.tint : Colors.light.tint,
        headerStyle: {
          backgroundColor:
            colorScheme === "dark" ? DarkTheme.colors.background : "white",
        },
      }}
    >
      <Stack.Screen name="home" options={{ title: "Home" }} />
      <Stack.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: true,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="simple-sentences"
        options={{
          title: "Simple Sentences",
          presentation: "modal",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="story-mode"
        options={{
          headerShown: true,
          title: "Story Mode",
        }}
      />
      <Stack.Screen
        name="story-reading"
        initialParams={{ story: {} }}
        options={{
          headerShown: false,
          title: "Story Reading",
          presentation: "modal",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="conversation-mode"
        options={{
          headerShown: false,
          title: "Conversation Mode",
          presentation: "modal",
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
