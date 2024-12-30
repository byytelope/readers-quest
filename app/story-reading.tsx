import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Text as DefaultText, View as DefaultView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { View, Text } from "@/components/Themed";
import { Story } from "@/utils/types";
import Button from "@/components/Button";

export default function StoryReadingScreen() {
  const router = useRouter();
  const { story: storyString } = useLocalSearchParams<{ story: string }>();
  const story: Story = JSON.parse(storyString);
  const [scores, setScores] = useState<number[]>([]);
  const [currentSentenceIndex, setCurrentSentence] = useState(0);

  return story ? (
    <SafeAreaView className="p-4 justify-between flex-1 bg-white dark:bg-black">
      <StatusBar style="light" />
      <View className="gap-4">
        <View className="items-center w-full pb-4">
          <Text className="text-xl p-4 rounded-xl bg-stone-200 dark:bg-stone-800">
            <Text className="font-bold">
              {scores
                .map((score) => Math.ceil(score * 10))
                .reduce((i, j) => i + j, 0)}
            </Text>
            {" points"}
          </Text>
        </View>
        <Text className="text-3xl font-bold text-center">{story.title}</Text>
        <DefaultText className="text-md text-stone-500 dark:text-stone-400 text-center mb-8">
          {story.tags}
        </DefaultText>
      </View>
      <View className="gap-8">
        {story.content.map((sentence, i) => (
          <View key={i} className={currentSentenceIndex === i ? "" : "hidden"}>
            <DefaultText className="text-2xl font-medium text-green-700 dark:text-green-500 pb-4">
              Say:
            </DefaultText>
            <Text className="font-bold pb-8 text-5xl leading-tight">
              {sentence}
            </Text>
            <DefaultView className="w-24 items-center text-xl p-4 rounded-xl bg-stone-200 dark:bg-stone-800">
              <Text className="text-2xl font-bold">
                {`${i + 1} / ${story.content.length}`}
              </Text>
            </DefaultView>
          </View>
        ))}
        <Button text="Finish Reading" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  ) : (
    <SafeAreaView className="p-4 justify-between flex-1 bg-white dark:bg-black">
      <View className="items-center h-full w-full justify-center">
        <Text className="font-bold text-3xl text-center">
          No story data available.
        </Text>
      </View>
      <Button text="Go Back" onPress={() => router.back()} />
    </SafeAreaView>
  );
}
