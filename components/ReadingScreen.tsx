import Ionicons from "@expo/vector-icons/Ionicons";
import { usePreventRemove } from "@react-navigation/native";
import { Audio } from "expo-av";
import { useNavigation, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text as DefaultText,
  useColorScheme,
  View as DefaultView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TextButton from "@/components/TextButton";
import { Text, View } from "@/components/Themed";
import { useAppContext } from "@/utils/appContext";
import {
  type ApiResult,
  type Feedback,
  getFriendlyFeedback,
} from "@/utils/types";

interface ReadingScreenProps {
  content: string[];
  title: string;
  subtitle: string;
}

export default function ReadingScreen({
  content,
  title,
  subtitle,
}: ReadingScreenProps) {
  const navigation = useNavigation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(subtitle);
  const [recording, setRecording] = useState<Audio.Recording>();
  const [scores, setScores] = useState<number[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const { state, updateState } = useAppContext();
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (currentSentenceIndex === content.length) {
      setMessage("");
    }

    if (getGrade() >= 0.5) {
      animationRef.current?.play();
    }
  }, [currentSentenceIndex, content.length]);

  usePreventRemove(!(currentSentenceIndex === content.length), ({ data }) => {
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
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording?.getURI();
    await callApi(uri ?? "");
    setRecording(undefined);
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
      formData.append("expected_text", content[currentSentenceIndex]);

      const response = await fetch("http://192.168.100.156:8000/grade", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      console.log("Audio uploaded successfully!");

      const result: ApiResult = await response.json();

      updateState("frustrated", result.frustrated);
      setFeedback(result.feedback);

      if (result.grade >= 0.8) {
        setMessage("🥳 You're doing great! Keep going!");
        setScores(scores.concat([Math.ceil(result.grade * 10)]));
        setCurrentSentenceIndex(currentSentenceIndex + 1);
      } else {
        setMessage(
          `🙂 Almost there! Try again or ask ${state.avatar} for help`,
        );
      }

      setIsUploading(false);
      console.log("API Response:", result);
    } catch (error) {
      setIsUploading(false);
      console.error("Error uploading audio", error);
      alert("Failed to upload audio.");
    }
  };

  const getGrade = useCallback(() => {
    const _score = scores.reduce((i, j) => i + j, 0);
    return _score / (content.length * 10);
  }, [scores, content.length]);

  const getAward = () => {
    const grade = getGrade();
    if (grade >= 0.8) {
      return { message: "You earned a Gold Award!", emoji: "🎖️" };
    }
    if (grade >= 0.65) {
      return { message: "You earned a Silver Award!", emoji: "🥈" };
    }
    if (grade >= 0.5) {
      return { message: "You earned a Bronze Award!", emoji: "🥉" };
    }
    return { message: "Keep practicing to earn an award!", emoji: "😊" };
  };

  return (
    <SafeAreaView className="p-4 justify-between flex-1 bg-white dark:bg-black">
      <StatusBar style="light" />
      {currentSentenceIndex === content.length ? (
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
                display: getGrade() >= 0.5 ? "flex" : "none",
              }}
              autoPlay={false}
            />
            <Text className="text-6xl pt-2">{getAward().emoji}</Text>
            <Text className="text-4xl font-bold text-center w-full">
              {getAward().message}
            </Text>
            <Text className="text-2xl text-center">
              Your total score is {scores.reduce((i, j) => i + j, 0)} points.
            </Text>
          </View>
          <TextButton text="Finish" onPress={() => router.dismissTo("/")} />
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
                <Text className="text-xl font-bold">{content.length}</Text>
              </DefaultView>
            </View>
            <Text className="text-3xl font-bold text-center">{title}</Text>
            <DefaultText className="text-md text-stone-500 dark:text-stone-400 text-center mb-4">
              {message}
            </DefaultText>
          </View>
          <View className="gap-8">
            {content.map((sentence, i) => (
              <View
                key={i}
                className={currentSentenceIndex === i ? "" : "hidden"}
              >
                <ScrollView
                  className="max-h-[26rem]"
                  alwaysBounceVertical={false}
                >
                  <DefaultText className="text-2xl font-medium text-lime-700 dark:text-lime-500 pb-4">
                    Say:
                  </DefaultText>
                  <Text className="font-bold text-5xl leading-tight">
                    {sentence}
                  </Text>
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
                  onPress={() =>
                    Speech.speak(content[currentSentenceIndex], {
                      rate: 0.5,
                    })
                  }
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
                onPressOut={stopRecording}
                disabled={isUploading}
                recording={recording !== undefined}
              />
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
