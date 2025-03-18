import Ionicons from "@expo/vector-icons/Ionicons";
import { usePreventRemove } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Text as DefaultText,
  View as DefaultView,
  Pressable,
  ScrollView,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TextButton from "@/components/TextButton";
import { Text, View } from "@/components/Themed";
import { useAppContext } from "@/utils/appContext";
import { getAward, getFriendlyFeedback } from "@/utils/helpers";
import type { ConversationContent } from "@/utils/types";
import { useAudioRecorder } from "@/utils/useAudioRecorder";

interface ConversationScreenProps {
  conversation: ConversationContent;
}

export default function ConversationScreen({
  conversation,
}: ConversationScreenProps) {
  const navigation = useNavigation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [animalSpeaking, setAnimalSpeaking] = useState(false);
  const [showAnimalDialog, setShowAnimalDialog] = useState(false);
  const { state, updateState } = useAppContext();
  const animationRef = useRef<LottieView>(null);

  const {
    record,
    stopRecording,
    isUploading,
    recording,
    feedback,
    setFeedback,
    scores,
    getGrade,
    message,
  } = useAudioRecorder();

  useEffect(() => {
    if (getGrade(conversation.child.length) >= 0.5) {
      animationRef.current?.play();
    }
  }, [conversation.child.length, getGrade]);

  usePreventRemove(
    !(currentSentenceIndex === conversation.child.length),
    ({ data }) => {
      Alert.alert(
        "Finish conversation?",
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
    },
  );

  const filteredFeedback = useCallback(
    () => feedback.filter((val) => val.type !== "extra"),
    [feedback],
  );

  const handleStopRecording = async () => {
    await stopRecording(
      conversation.child[currentSentenceIndex],
      "http://192.168.100.170:8000/grade",
      // "http://localhost:8000/grade",
      (res) => {
        updateState("frustrated", res.frustrated);
        if (res.grade >= 0.8) {
          setFeedback([]);
          setAnimalSpeaking(true);
          setShowAnimalDialog(true);
          Speech.speak(conversation.ai[currentSentenceIndex], {
            language: "en-UK",
            onDone: () => {
              setCurrentSentenceIndex(currentSentenceIndex + 1);
              setAnimalSpeaking(false);
              setShowAnimalDialog(false);
            },
          });
        } else {
          setAnimalSpeaking(true);
          Speech.speak("Almost there...Try again!", {
            language: "en-UK",
            onDone: () => setAnimalSpeaking(false),
          });
        }
      },
    );
  };

  return (
    <SafeAreaView className="p-4 justify-between flex-1 bg-white dark:bg-black">
      <StatusBar style="light" />
      {currentSentenceIndex === conversation.child.length ? (
        <>
          <View className="gap-4 items-center justify-center flex-1">
            <LottieView
              ref={animationRef}
              source={require("@/assets/lottie/confetti.json")}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                backgroundColor: "transparent",
                display:
                  getGrade(conversation.child.length) >= 0.5 ? "flex" : "none",
              }}
              autoPlay={false}
            />
            <Text className="text-6xl pt-2">
              {getAward(getGrade(conversation.child.length)).emoji}
            </Text>
            <Text className="text-4xl font-bold text-center w-full">
              {getAward(getGrade(conversation.child.length)).message}
            </Text>
            <Text className="text-2xl text-center">
              Your total score is {scores.reduce((i, j) => i + j, 0)} points.
            </Text>
          </View>
          <TextButton
            text="Finish"
            onPress={() => router.dismissTo("/(protected)/home")}
          />
        </>
      ) : (
        <>
          <View className="gap-4">
            <View className="items-center justify-center w-full flex-row gap-4">
              <DefaultView className="w-fit flex-row gap-1 items-center justify-center text-xl p-4 rounded-xl bg-transparent border-2 border-stone-300 dark:border-stone-800">
                <Text className="text-xl font-bold">
                  {scores.reduce((i, j) => i + j, 0)}
                </Text>
                <Text className="text-xl">points</Text>
              </DefaultView>
              <DefaultView className="w-24 items-center justify-center flex-row gap-2 p-4 rounded-xl bg-transparent border-2 border-stone-300 dark:border-stone-800">
                <Text className="text-xl font-bold">
                  {currentSentenceIndex + 1}
                </Text>
                <Text>/</Text>
                <Text className="text-xl font-bold">
                  {conversation.child.length}
                </Text>
              </DefaultView>
            </View>
            <Text className="text-xl font-bold text-center">{message}</Text>
          </View>
          <View className="gap-8">
            {conversation.child.map((sentence, sentenceIdx) => (
              <View
                // biome-ignore lint/suspicious/noArrayIndexKey: bruh
                key={sentenceIdx}
                className={currentSentenceIndex === sentenceIdx ? "" : "hidden"}
              >
                <ScrollView
                  className="max-h-[30rem] sm:max-h-[20rem]"
                  alwaysBounceVertical={false}
                >
                  <View className={showAnimalDialog ? "hidden" : ""}>
                    <DefaultText className="text-2xl font-extrabold text-lime-700 dark:text-lime-500 pb-4">
                      Say:
                    </DefaultText>
                    <View className="gap-2 flex-row flex-wrap">
                      {sentence.split(" ").map((word, wordIdx) => (
                        <Text
                          // biome-ignore lint/suspicious/noArrayIndexKey: bruh
                          key={`word-${wordIdx}`}
                          className={`font-bold text-5xl leading-tight ${filteredFeedback().length === 0 ? "!text-inherit" : filteredFeedback()[wordIdx]?.type !== "correct" ? "!text-red-500" : "!text-inherit"}`}
                        >
                          {word}
                        </Text>
                      ))}
                    </View>
                  </View>
                  <View className={showAnimalDialog ? "" : "hidden"}>
                    <DefaultText className="text-2xl font-extrabold text-lime-700 dark:text-lime-500 pb-4">
                      {state.avatar}:
                    </DefaultText>
                    <Text className="font-bold text-5xl leading-tight">
                      {conversation.ai[sentenceIdx]}
                    </Text>
                  </View>
                </ScrollView>
              </View>
            ))}
            <View className="gap-4 shrink-0">
              <View className="w-full flex-row gap-4">
                <Pressable
                  onPress={() => {
                    Alert.alert(
                      "Here's some help!",
                      getFriendlyFeedback(feedback),
                    );
                  }}
                  disabled={
                    feedback.length === 0 ||
                    feedback.every((f) => f.type === "correct")
                  }
                  className="w-24 h-20 items-center justify-center flex-1 text-xl p-4 rounded-xl disabled:border-2 border-stone-300 dark:border-stone-800 bg-stone-200 dark:bg-stone-800 disabled:bg-transparent active:bg-stone-300 dark:active:bg-stone-700 group"
                >
                  <DefaultText className="text-xl font-bold text-black dark:text-white group-disabled:text-stone-400">
                    {`Ask ${state.avatar}`}
                  </DefaultText>
                </Pressable>
                <Pressable
                  disabled={animalSpeaking}
                  onPress={() => {
                    setAnimalSpeaking(true);
                    Speech.speak(conversation.child[currentSentenceIndex], {
                      language: "en-UK",
                      rate: 0.5,
                      onDone: () => setAnimalSpeaking(false),
                    });
                  }}
                  className="w-fit min-w-24 h-20 items-center justify-center text-xl p-4 rounded-xl disabled:border-2 border-stone-300 dark:border-stone-800 bg-stone-200 dark:bg-stone-800 disabled:bg-transparent active:bg-stone-300 dark:active:bg-stone-700 group"
                >
                  <Ionicons
                    name="ear-outline"
                    size={32}
                    color={colorScheme === "dark" ? "white" : "black"}
                  />
                </Pressable>
                <Pressable
                  onPress={() => {
                    setFeedback([]);
                    setCurrentSentenceIndex(currentSentenceIndex + 1);
                  }}
                  className="w-fit min-w-24 h-20 items-center justify-center text-xl p-4 rounded-xl disabled:border-2 border-stone-300 dark:border-stone-800 bg-stone-200 dark:bg-stone-800 disabled:bg-transparent active:bg-stone-300 dark:active:bg-stone-700 group"
                >
                  <Ionicons
                    name="chevron-forward"
                    size={32}
                    color={colorScheme === "dark" ? "white" : "black"}
                  />
                </Pressable>
              </View>
              <TextButton
                text={
                  recording !== undefined
                    ? "Listening..."
                    : isUploading
                      ? "Checking..."
                      : "Hold and Speak"
                }
                onPressIn={record}
                onPressOut={handleStopRecording}
                disabled={isUploading || animalSpeaking}
                recording={recording !== undefined}
              />
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
