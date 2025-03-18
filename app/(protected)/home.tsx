import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Pressable, Text as DefaultText, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import EmotionalCheckInModal from "@/components/EmotionalCheckInModal";
import SelectButton from "@/components/SelectButton";
import TextButton from "@/components/TextButton";
import { Text, View } from "@/components/Themed";
import { useAppContext } from "@/utils/appContext";
import { useSupabase } from "@/utils/supabaseContext";

export default function HomeScreen() {
  const avatars = ["Giraffe", "Elephant", "Bear", "Tiger"] as const;
  const router = useRouter();
  const colorScheme = useColorScheme();
  const sheetRef = useRef<BottomSheetModal>(null);
  const { state, updateState } = useAppContext();
  const { user } = useSupabase();

  useEffect(() => {
    if (state.frustrated) {
      sheetRef.current?.present();
    }
  }, [state.frustrated]);

  return (
    <SafeAreaView className="flex-1 items-center p-4 gap-4 bg-white dark:bg-black">
      <EmotionalCheckInModal ref={sheetRef} />
      <View className="w-full flex-row justify-end items-center gap-2">
        <View className="flex-row items-center h-12 px-3 gap-2">
          <Ionicons
            name="star"
            size={24}
            color={colorScheme === "dark" ? "white" : "gold"}
          />
          <Text className="font-bold">{user?.score.toLocaleString() || 0}</Text>
        </View>
        <Pressable
          className="justify-center items-center size-12 bg-stone-100 active:bg-stone-200 dark:bg-stone-800 dark:active:bg-stone-900 rounded-lg"
          onPress={() => {
            router.push("/(protected)/profile");
          }}
        >
          <Ionicons
            name="person-outline"
            size={24}
            color={colorScheme === "dark" ? "white" : "black"}
          />
        </Pressable>
      </View>
      <View className="flex-1 items-center justify-center gap-4">
        <DefaultText className="text-4xl font-black text-lime-700  dark:text-lime-400 text-center">
          Reader's Quest
        </DefaultText>
        <Text className="text-xl font-medium text-center pb-2">
          Who do you wanna explore with today?
        </Text>
        <View className="flex-row justify-center gap-2 md:gap-4 lg:gap-8">
          {avatars.map((avatar) => (
            <SelectButton
              key={avatar}
              onPress={() => {
                updateState("avatar", avatar);
              }}
              active={state.avatar === avatar}
            >
              {avatar === "Giraffe" ? (
                <Image
                  source={require("@/assets/images/Giraffe.png")}
                  style={{ width: 40, height: 40 }}
                />
              ) : avatar === "Elephant" ? (
                <Image
                  source={require("@/assets/images/Elephant.png")}
                  style={{ width: 40, height: 40 }}
                />
              ) : avatar === "Bear" ? (
                <Image
                  source={require("@/assets/images/Bear.png")}
                  style={{ width: 40, height: 40 }}
                />
              ) : (
                <Image
                  source={require("@/assets/images/Tiger.png")}
                  style={{ width: 40, height: 40 }}
                />
              )}
            </SelectButton>
          ))}
        </View>
      </View>
      <View className="gap-4 w-full px-0 sm:px-24 lg:px-64">
        <TextButton
          text="Simple Sentences"
          onPress={() => router.push("/simple-sentences")}
        />
        <TextButton
          text="Story Mode"
          onPress={() => router.push("/story-mode")}
        />
        <TextButton
          text={`Talk to ${state.avatar}`}
          onPress={() => router.push("/conversation-mode")}
        />
      </View>
    </SafeAreaView>
  );
}
