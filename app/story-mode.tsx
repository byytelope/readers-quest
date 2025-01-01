import { useRouter } from "expo-router";
import { useState } from "react";
import { View as DefaultView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SelectButton from "@/components/SelectButton";
import TextButton from "@/components/TextButton";
import { Text, View } from "@/components/Themed";
import { stories, type StoryTheme } from "@/utils/types";

export default function StoryModeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme>("animals");

  const storyThemes: { label: string; value: StoryTheme }[] = [
    { label: "🐶  Animals", value: "animals" },
    { label: "⚔  Adventure", value: "adventure" },
    { label: "🧑  Friends", value: "friends" },
  ];

  const handleStartReading = () => {
    router.push({
      pathname: "/story-reading",
      params: { story: JSON.stringify(stories[selectedTheme]) },
    });
  };

  return (
    <View
      className="flex-1 items-center justify-between p-4 bg-white dark:bg-black"
      style={{
        paddingTop: 16,
        paddingBottom: insets.bottom,
      }}
    >
      <View className="gap-4 w-full">
        <Text className="font-bold text-xl">Choose Theme</Text>
        <View className="w-full flex-col gap-4">
          {storyThemes.map((storyTheme) => (
            <View key={storyTheme.value} className="gap-4">
              <SelectButton
                active={selectedTheme === storyTheme.value}
                onPress={() => setSelectedTheme(storyTheme.value)}
                className="w-full !items-start"
              >
                <Text className="font-medium text-lg">{storyTheme.label}</Text>
              </SelectButton>
              <DefaultView
                className={`p-4 border-2 border-stone-300 dark:border-stone-700 rounded-xl ${
                  selectedTheme === storyTheme.value ? "" : "hidden"
                }`}
              >
                <Text className="text-xl font-bold pb-1">
                  {stories[selectedTheme].title}
                </Text>
                <Text className="text-md text-stone-500 pb-3">
                  {stories[selectedTheme].tags}
                </Text>
                <Text className="font-md">
                  {stories[selectedTheme].description}
                </Text>
              </DefaultView>
            </View>
          ))}
        </View>
      </View>
      <TextButton text="Start Reading" onPress={handleStartReading} />
    </View>
  );
}
