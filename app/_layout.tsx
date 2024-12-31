import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { AudioModule } from "expo-audio";
import "expo-dev-client";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme, Platform } from "react-native";
import "react-native-reanimated";

import "../global.css";
import Colors from "@/constants/Colors";

if (Platform.OS === "android") {
  NavigationBar.setPositionAsync("absolute");
  NavigationBar.setBackgroundColorAsync("transparent");
}

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        alert("Permission to access microphone was denied");
      }
    })();
  }, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar translucent={true} backgroundColor={"transparent"} />
      <Stack
        screenOptions={{
          headerTintColor:
            colorScheme === "dark" ? Colors.dark.tint : Colors.light.tint,
          headerTransparent: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            title: "Home",
          }}
        />
        <Stack.Screen
          name="story-mode"
          options={{
            headerShown: true,
            title: "Story Mode",
            headerLargeTitle: true,
            headerLargeTitleShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="simple-sentences"
          options={{
            headerShown: false,
            title: "Simple Sentences",
            presentation: "modal",
            headerBackVisible: false,
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
      </Stack>
    </ThemeProvider>
  );
}
