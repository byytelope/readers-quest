import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Audio } from "expo-av";
import "expo-dev-client";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme, Platform } from "react-native";
import {
  ReanimatedLogLevel,
  configureReanimatedLogger,
} from "react-native-reanimated";

import "../global.css";
import Colors from "@/constants/Colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [permissionResponse, requestPermission] = Audio.usePermissions();
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
    if (Platform.OS === "android") {
      NavigationBar.setPositionAsync("absolute");
      NavigationBar.setBackgroundColorAsync("#ffffff00");
    }

    configureReanimatedLogger({
      level: ReanimatedLogLevel.warn,
      strict: false,
    });

    if (permissionResponse == null || permissionResponse.status !== "granted") {
      console.log("Requesting permission..");
      requestPermission();
    }
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
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
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
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
