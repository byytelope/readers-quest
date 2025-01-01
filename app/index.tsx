import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import EmotionalCheckInModal from "@/components/EmotionalCheckInModal";
import SelectButton from "@/components/SelectButton";
import TextButton from "@/components/TextButton";
import { Text, View } from "@/components/Themed";
import { useAppContext } from "@/utils/appContext";

export default function HomeScreen() {
  const avatars = ["Giraffe", "Elephant", "Bear", "Tiger"];
  const router = useRouter();
  const sheetRef = useRef<BottomSheetModal>(null);
  const { state, updateState } = useAppContext();

  useEffect(() => {
    if (state.frustrated) {
      sheetRef.current?.present();
    }
  }, [state.frustrated]);

  return (
    <SafeAreaView className="flex-1 items-center px-4 bg-white dark:bg-black">
      <EmotionalCheckInModal ref={sheetRef} />
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="text-4xl font-black text-lime-600 text-center">
          Reader's Quest
        </Text>
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
