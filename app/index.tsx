import { useState } from "react";
import { Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import Button from "@/components/Button";
import { View, Text } from "@/components/Themed";

export default function HomeScreen() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const avatars = ["Giraffe", "Elephant", "Bear", "Tiger"];
  const router = useRouter();
  const handleContinue = () => {
    if (selectedAvatar) {
      router.push("/simple-sentences");
    } else {
      Alert.alert("Select an Avatar", "Please select an avatar to continue!");
    }
  };

  return (
    <SafeAreaView className="flex-1 items-center px-4 bg-white dark:bg-black">
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="text-2xl font-bold">Reader&apos;s Quest</Text>
        <Text className="text-lg text-center pb-2">
          Select your avatar and get ready for the adventure!
        </Text>
        <View className="flex-row justify-center gap-2 md:gap-4 lg:gap-8">
          {avatars.map((avatar) => (
            <Pressable
              key={avatar}
              onPress={() => setSelectedAvatar(avatar)}
              className={`p-4 w-24 h-24 md:w-36 md:h-36 justify-center items-center border-2 rounded-xl ${selectedAvatar == avatar ? "border-green-600" : "border-stone-300 dark:border-stone-800"}`}
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
            </Pressable>
          ))}
        </View>
      </View>
      <View className="gap-4 w-full">
        <Button
          text={
            // !selectedAvatar
            //   ? "Select an animal"
            //   : `Enter with ${selectedAvatar}`
            "Simple Sentences"
          }
          onPress={handleContinue}
          disabled={!selectedAvatar}
        />
        <Button text="Story Mode" onPress={() => router.push("/story-mode")} />
        <Button text="Sitemap" onPress={() => router.push("/_sitemap")} />
      </View>
    </SafeAreaView>
  );
}
