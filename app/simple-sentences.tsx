import { useAudioRecorder, RecordingPresets } from "expo-audio";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Text as DefaultText, View as DefaultView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/Button";
import { Text, View } from "@/components/Themed";

export default function SimpleSentencesScreen() {
  const router = useRouter();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [retryEligible, setRetryEligible] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  const sentences = [
    "The cat is on the mat.",
    "I like ice cream.",
    "She has a red balloon.",
  ];

  const handleContinue = () => {
    if (currentSentenceIndex === sentences.length) {
      router.dismissTo("/");
    } else {
      if (!retryEligible) {
        setCurrentSentenceIndex(currentSentenceIndex + 1);
      } else {
        setRetryEligible(false);
      }
    }
  };

  const record = () => {
    audioRecorder.record();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    await audioRecorder.stop();
    setIsRecording(false);
    await callApi(audioRecorder.uri!);
  };

  const callApi = async (uri: string) => {
    try {
      setIsUploading(true);

      const fileName = uri.split("/").pop() || "audio.m4a";
      const formData = new FormData();
      const audio_file = {
        uri,
        name: fileName,
        type: "audio/m4a",
      };

      formData.append("audio", audio_file as any);
      formData.append("expected_text", sentences[currentSentenceIndex]);

      const response = await fetch("http://localhost:8000/grade/", {
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
    <SafeAreaView className="flex-1 items-center justify-between p-4 bg-white dark:bg-black">
      <StatusBar style="light" />
      <View className="gap-4">
        <View className="items-center w-full">
          <Text className="text-xl p-4 rounded-xl bg-stone-200 dark:bg-stone-800">
            <Text className="font-bold">
              {scores
                .map((score) => Math.ceil(score * 10))
                .reduce((i, j) => i + j, 0)}
            </Text>
            {" points"}
          </Text>
        </View>
      </View>
      <View className="gap-8 w-full">
        {sentences.map((sentence, i) => (
          <View key={i} className={currentSentenceIndex === i ? "" : "hidden"}>
            <DefaultText className="text-2xl font-medium text-green-700 dark:text-green-500 pb-4">
              Say:
            </DefaultText>
            <Text className="font-bold pb-8 text-5xl leading-tight">
              {sentence}
            </Text>
            <DefaultView className="w-24 items-center text-xl p-4 rounded-xl bg-stone-200 dark:bg-stone-800">
              <Text className="text-2xl font-bold">
                {`${i + 1} / ${sentences.length}`}
              </Text>
            </DefaultView>
          </View>
        ))}
        <Button
          text={
            currentSentenceIndex === sentences.length
              ? "Finish"
              : retryEligible
                ? "Retry"
                : isRecording
                  ? "Listening..."
                  : isUploading
                    ? "Checking..."
                    : "Hold to Speak"
          }
          onPressIn={
            retryEligible || currentSentenceIndex === sentences.length
              ? undefined
              : record
          }
          onPressOut={
            retryEligible || currentSentenceIndex === sentences.length
              ? undefined
              : stopRecording
          }
          onPress={
            retryEligible || currentSentenceIndex === sentences.length
              ? handleContinue
              : undefined
          }
          disabled={isUploading}
          recording={isRecording}
        />
      </View>
    </SafeAreaView>
  );
}
