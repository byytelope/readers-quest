import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Audio } from "expo-av";
import "expo-dev-client";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, useColorScheme } from "react-native";
import {
  ReanimatedLogLevel,
  configureReanimatedLogger,
} from "react-native-reanimated";

import "../global.css";
import Colors from "@/constants/Colors";
import { AppProvider } from "@/utils/appContext";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const [permissionResponse, requestPermission] = Audio.usePermissions();

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
  }, [permissionResponse, requestPermission]);

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <AppProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView>
          <BottomSheetModalProvider>
            <StatusBar translucent={true} backgroundColor={"transparent"} />
            <Stack
              screenOptions={{
                headerTintColor:
                  colorScheme === "dark" ? Colors.dark.tint : Colors.light.tint,
                headerTransparent: false,
                headerStyle: {
                  backgroundColor:
                    colorScheme === "dark"
                      ? DarkTheme.colors.background
                      : "white",
                },
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
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </AppProvider>
  );
}
