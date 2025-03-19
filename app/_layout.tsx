import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Audio } from "expo-av";
import "expo-dev-client";
import * as NavigationBar from "expo-navigation-bar";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppState, Platform, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  ReanimatedLogLevel,
  configureReanimatedLogger,
} from "react-native-reanimated";

import "@/global.css";
import Colors from "@/constants/Colors";
import { AppProvider } from "@/utils/appContext";
import { supabase } from "@/utils/supabase";
import { SupabaseProvider } from "@/utils/supabaseContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => {
      listener.remove();
    };
  }, []);

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
      <SupabaseProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <GestureHandlerRootView>
            <BottomSheetModalProvider>
              <StatusBar
                translucent={true}
                backgroundColor={"transparent"}
                animated
              />
              <Stack
                screenOptions={{
                  headerShown: false,
                  headerLargeTitle: true,
                  headerTintColor:
                    colorScheme === "dark"
                      ? Colors.dark.tint
                      : Colors.light.tint,
                  headerTransparent: true,
                  headerStyle: {
                    backgroundColor:
                      colorScheme === "dark"
                        ? DarkTheme.colors.background
                        : "white",
                  },
                }}
              >
                <Stack.Screen name="index" options={{ title: "Welcome" }} />
                <Stack.Screen
                  name="sign-in"
                  options={{
                    title: "Sign In",
                    presentation: "modal",
                    headerShown: true,
                  }}
                />
                <Stack.Screen
                  name="sign-up"
                  options={{
                    title: "Sign Up",
                    presentation: "modal",
                    headerShown: false,
                  }}
                />
              </Stack>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </ThemeProvider>
      </SupabaseProvider>
    </AppProvider>
  );
}
