import { usePreventRemove } from "@react-navigation/native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  Text as DefaultText,
  View as DefaultView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { View, Text } from "@/components/Themed";
import { Story } from "@/utils/types";
import TextButton from "@/components/TextButton";

export default function StoryReadingScreen() {
  const { story: storyString } = useLocalSearchParams<{ story: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const [story, setStory] = useState<Story>();
  const [isUploading, setIsUploading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording>();
  const [retryEligible, setRetryEligible] = useState(false);
  const [finished, setFinished] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  useEffect(() => {
    const _story: Story = JSON.parse(storyString);
    setStory(_story);
  }, []);

  useEffect(() => {
    if (currentSentenceIndex === story?.content.length) {
      setFinished(true);
    }
  }, [currentSentenceIndex]);

  usePreventRemove(!finished, ({ data }) => {
    Alert.alert(
      "Finish reading?",
      "You will lose your progress if you go back!",
      [
        { text: "Stay", style: "cancel", onPress: () => {} },
        {
          text: "Finish",
          style: "destructive",
          onPress: () => navigation.dispatch(data.action),
        },
      ],
    );
  });

  const handleContinue = () => {
    if (currentSentenceIndex === story?.content.length) {
      router.dismissTo("/");
    } else {
      if (!retryEligible) {
        setCurrentSentenceIndex(currentSentenceIndex + 1);
      } else {
        setRetryEligible(false);
      }
    }
  };
  const record = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    await recording!.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording!.getURI();
    await callApi(uri!);
    setRecording(undefined);
  };

  const callApi = async (uri: string) => {
    try {
      setIsUploading(true);

      const fileName = uri.split("/").pop() || "audio.m4a";
      console.log(fileName);
      const formData = new FormData();
      const audio_file = {
        uri,
        name: fileName,
        type: "audio/m4a",
      };

      formData.append("audio", audio_file as any);
      formData.append(
        "expected_text",
        story?.content[currentSentenceIndex] ?? "",
      );

      const response = await fetch("http://192.168.100.156:8000/grade/", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      console.log("Audio uploaded successfully!");

      const result: { grade: number; frustration: number; feedback: string[] } =
        await response.json();

      if (result.grade > 0.8) {
        setScores(scores.concat([result.grade]));
        setCurrentSentenceIndex(currentSentenceIndex + 1);
        setRetryEligible(false);
      } else {
        setRetryEligible(true);
      }

      setIsUploading(false);
      console.log("API Response:", result);
    } catch (error) {
      setIsUploading(false);
      console.error("Error uploading audio", error);
      alert("Failed to upload audio.");
    }
  };

  return (
    <SafeAreaView className="p-4 justify-between flex-1 bg-white dark:bg-black">
      <StatusBar style="light" />
      {story ? (
        <>
          <View className="gap-4">
            <View className="items-center w-full">
              <DefaultView className="w-fit flex-row gap-1 items-center justify-center text-xl p-4 rounded-xl bg-transparent border-2 border-stone-300 dark:border-stone-800">
                <Text className="text-xl font-bold">
                  {scores
                    .map((score) => Math.ceil(score * 10))
                    .reduce((i, j) => i + j, 0)}
                </Text>
                <Text className="text-xl">points</Text>
              </DefaultView>
            </View>
            <Text className="text-3xl font-bold text-center">
              {story.title}
            </Text>
            <DefaultText className="text-md text-stone-500 dark:text-stone-400 text-center mb-8">
              {story.tags}
            </DefaultText>
          </View>
          <Text
            className={`text-4xl font-bold ${finished ? "" : "hidden"} text-center w-full`}
          >
            Perfect run! Welldone
          </Text>
          <View className="gap-8">
            {story.content.map((sentence, i) => (
              <View
                key={i}
                className={currentSentenceIndex === i ? "" : "hidden"}
              >
                <DefaultText className="text-2xl font-medium text-lime-700 dark:text-lime-500 pb-4">
                  Say:
                </DefaultText>
                <Pressable
                  className="active:bg-stone-200 dark:active:bg-stone-800 rounded-xl mb-8"
                  onPress={() => Speech.speak(sentence, { rate: 0.5 })}
                >
                  <Text className="font-bold text-5xl leading-tight">
                    {sentence}
                  </Text>
                </Pressable>
                <View className="w-full flex-row gap-4">
                  <DefaultView className="w-24 items-center justify-center text-xl p-4 rounded-xl bg-transparent border-2 border-stone-300 dark:border-stone-800">
                    <Text className="text-2xl font-bold">
                      {`${i + 1} / ${story.content.length}`}
                    </Text>
                  </DefaultView>
                  <Pressable
                    onPress={() =>
                      setCurrentSentenceIndex(currentSentenceIndex + 1)
                    }
                    disabled={currentSentenceIndex === story.content.length}
                    className="w-24 items-center justify-center flex-1 text-xl p-4 rounded-xl disabled:border-2 border-stone-300 dark:border-stone-800 bg-stone-200 dark:bg-stone-800 disabled:bg-transparent active:bg-stone-300 dark:active:bg-stone-700 group"
                  >
                    <DefaultText className="text-xl font-bold text-black dark:text-white group-disabled:text-stone-400">
                      Skip
                    </DefaultText>
                  </Pressable>
                </View>
              </View>
            ))}
            <TextButton
              text={
                currentSentenceIndex === story.content.length
                  ? "Finish"
                  : recording !== undefined
                    ? "Listening..."
                    : isUploading
                      ? "Checking..."
                      : "Hold and Speak"
              }
              onPressIn={
                retryEligible || currentSentenceIndex === story.content.length
                  ? undefined
                  : record
              }
              onPressOut={
                retryEligible || currentSentenceIndex === story.content.length
                  ? undefined
                  : stopRecording
              }
              onPress={
                retryEligible || currentSentenceIndex === story.content.length
                  ? handleContinue
                  : undefined
              }
              disabled={isUploading}
              recording={recording !== undefined}
            />
          </View>
        </>
      ) : (
        <>
          <View className="items-center h-full w-full justify-center">
            <Text className="font-bold text-3xl text-center">
              No story data available.
            </Text>
          </View>
          <TextButton text="Go Back" onPress={() => router.back()} />
        </>
      )}
    </SafeAreaView>
  );
}
