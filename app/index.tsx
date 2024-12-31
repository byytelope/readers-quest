import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import EmotionalCheckInModal from "@/components/EmotionalCheckInModal";
import SelectButton from "@/components/SelectButton";
import { View, Text } from "@/components/Themed";
import TextButton from "@/components/TextButton";

export default function HomeScreen() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const sheetRef = useRef<BottomSheetModal>(null);
  const avatars = ["Giraffe", "Elephant", "Bear", "Tiger"];
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 items-center px-4 bg-white dark:bg-black">
      <EmotionalCheckInModal ref={sheetRef} />
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="text-2xl font-bold">Reader&apos;s Quest</Text>
        <Text className="text-lg text-center pb-2">
          Select your avatar and get ready for the adventure!
        </Text>
        <View className="flex-row justify-center gap-2 md:gap-4 lg:gap-8">
          {avatars.map((avatar) => (
            <SelectButton
              key={avatar}
              onPress={() => setSelectedAvatar(avatar)}
              active={selectedAvatar == avatar}
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
      <View className="gap-4 w-full">
        <TextButton
          text="Simple Sentences"
          onPress={() => router.push("/simple-sentences")}
        />
        <TextButton
          text="Story Mode"
          onPress={() => router.push("/story-mode")}
        />
        <TextButton text="Sitemap" onPress={() => router.push("/_sitemap")} />
        <TextButton
          text="Show Modal"
          onPress={() => sheetRef.current?.present()}
        />
      </View>
    </SafeAreaView>
  );
}
