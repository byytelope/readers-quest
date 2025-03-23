import Ionicons from "@expo/vector-icons/Ionicons";
import { usePreventRemove } from "@react-navigation/native";
import { AuthError } from "@supabase/supabase-js";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";
import type LottieView from "lottie-react-native";
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

import ConfettiView from "@/components/ConfettiView";
import TextButton from "@/components/TextButton";
import { Text, View } from "@/components/Themed";
import { supabase } from "@/utils/supabase";
import { useSupabase } from "@/utils/supabaseContext";
import { useAudioRecorder } from "@/utils/useAudioRecorder";

const content = [
  "Once upon a time, there was a little girl who lived in a village near the forest.",
  "She was the sweetest little girl that had ever been seen.",
  "Her mother was very fond of her, and her grandmother loved her even more.",
  "To show her love, the grandmother had made her a red riding hood.",
  "The girl loved it so much that she wore it all the time.",
  "That's why everyone called her Little Red Riding Hood.",
];

export default function PeerReadingScreen() {
  const {
    sessionCode,
    isHost,
    userId,
  }: {
    sessionCode: string;
    isHost: "true" | "false";
    userId: string;
  } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const animationRef = useRef<LottieView>(null);
  const sessionEndedByPeerRef = useRef(false);
  const { user, updateUser } = useSupabase();

  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [peerName, setPeerName] = useState("Peer");
  const [isMyTurn, setIsMyTurn] = useState(isHost === "true");
  const [readingComplete, setReadingComplete] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);

  const {
    record,
    stopRecording,
    isUploading,
    recording,
    feedback,
    setFeedback,
    getGrade,
    scores,
    message,
  } = useAudioRecorder();

  type SwitchTurnEvent =
    | {
        userId: string;
        currentIndex: number;
        status: "completed";
      }
    | {
        userId: string;
        status: "retrying";
      };

  // biome-ignore lint/correctness/useExhaustiveDependencies: bruh
  useEffect(() => {
    if (currentSentenceIndex === content.length) {
      if (getGrade(content.length) >= 0.5) {
        animationRef.current?.play();
      }
    }
  }, [currentSentenceIndex]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: bruh
  useEffect(() => {
    if (!sessionCode || !userId) return;

    const channel = supabase
      .channel(`reading-session-${sessionCode}`)
      .on<SwitchTurnEvent>(
        "broadcast",
        { event: "reading-turn" },
        ({ payload }) => {
          if (payload.userId !== userId) {
            console.log("Received message:", payload);
            if (payload.status !== "retrying") {
              setIsMyTurn(false);
            }
            setIsMyTurn(true);
          } else {
            if (payload.status === "retrying") {
              setIsMyTurn(true);
            }

            setIsMyTurn(false);
          }

          if (payload.status === "completed") {
            setFeedback([]);
            setCurrentSentenceIndex(payload.currentIndex + 1);
          }
        },
      )
      .on("broadcast", { event: "session-complete" }, () => {
        setReadingComplete(true);
      })
      .on<{ name: string }>(
        "broadcast",
        { event: "session-ended" },
        ({ payload }) => {
          console.log(`Session ended by ${payload.name}`);
          Alert.alert(`Session ended by ${payload.name}`);
          sessionEndedByPeerRef.current = true;
          setReadingComplete(true);
          router.dismissTo("/(protected)/home");
        },
      )
      .on<{ name: string }>(
        "broadcast",
        { event: "peer-joined" },
        ({ payload }) => {
          setPeerConnected(true);
          setPeerName(payload.name);
        },
      )
      .subscribe();

    if (isHost === "false") {
      supabase.channel(`reading-session-${sessionCode}`).send({
        type: "broadcast",
        event: "peer-joined",
        payload: { name: user?.name },
      });
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionCode, userId, isHost]);

  const switchTurnEvent = useCallback(
    (data: SwitchTurnEvent) => {
      if (!sessionCode) return;

      console.log("Sending message:", data);

      supabase.channel(`reading-session-${sessionCode}`).send({
        type: "broadcast",
        event: "reading-turn",
        payload: { ...data },
      });
    },
    [sessionCode],
  );

  const handleStartRecording = async () => {
    if (!isMyTurn) return;

    await record(
      content[currentSentenceIndex],
      `${process.env.EXPO_PUBLIC_SERVER_URL}:8000/grade`,
      (res) => {
        if (res.grade >= 0.8) {
          if (currentSentenceIndex + 1 >= content.length) {
            setReadingComplete(true);
            supabase.channel(`reading-session-${sessionCode}`).send({
              type: "broadcast",
              event: "session-complete",
              payload: {},
            });
          } else {
            switchTurnEvent({
              status: "completed",
              userId,
              currentIndex: currentSentenceIndex,
            });
          }
        } else {
          switchTurnEvent({
            status: "retrying",
            userId,
          });
        }
      },
    );
  };

  const handleStopRecording = async () => {
    await stopRecording();
  };

  const handleSkipTurn = () => {
    if (!isMyTurn) return;

    if (currentSentenceIndex + 1 >= content.length) {
      setReadingComplete(true);
      supabase.channel(`reading-session-${sessionCode}`).send({
        type: "broadcast",
        event: "session-complete",
        payload: {},
      });
    } else {
      switchTurnEvent({
        currentIndex: currentSentenceIndex,
        status: "completed",
        userId,
      });
    }
  };

  const handleFinish = async () => {
    if (user) {
      const newScore = user?.score + scores.reduce((i, j) => i + j, 0);
      const error = await updateUser({ score: newScore });

      if (!error) {
        router.dismissTo("/(protected)/home");
      } else {
        console.log(error.message);
      }
    } else {
      throw new AuthError("User not authenticated properly.", 403);
    }
  };

  const filteredFeedback = useCallback(
    () => feedback.filter((val) => val.type !== "extra"),
    [feedback],
  );

  usePreventRemove(!readingComplete, ({ data }) => {
    if (sessionEndedByPeerRef.current) {
      return navigation.dispatch(data.action);
    }

    Alert.alert(
      "Finish session?",
      "You and your peer will lose your progress if you go back!",
      [
        { text: "Stay", style: "cancel", onPress: () => {} },
        {
          text: "Finish",
          style: "destructive",
          onPress: () => {
            supabase.channel(`reading-session-${sessionCode}`).send({
              type: "broadcast",
              event: "session-ended",
              payload: { name: user?.name },
            });

            navigation.dispatch(data.action);
          },
        },
      ],
    );
  });

  if (isHost === "true" && !peerConnected) {
    return (
      <SafeAreaView className="p-4 justify-between flex-1 bg-white dark:bg-black">
        <StatusBar style="light" animated />
        <View className="gap-16 items-center justify-center flex-1">
          <View className="items-center justify-center gap-4">
            <Text className="text-4xl font-bold text-center">
              Waiting to Connect
            </Text>
            <Text className="text-xl text-center">
              Share this code with your reading partner
            </Text>
          </View>
          <Pressable className="bg-stone-200 dark:bg-stone-800 px-8 py-6 rounded-xl justify-center items-center">
            <Text className="text-5xl font-bold tracking-wider text-center pt-2">
              {sessionCode}
            </Text>
          </Pressable>
        </View>
        <TextButton text="Cancel" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (readingComplete) {
    return (
      <SafeAreaView className="p-4 justify-between flex-1 bg-white dark:bg-black">
        <StatusBar style="light" animated />
        <ConfettiView
          ref={animationRef}
          content={content}
          getGrade={getGrade}
          handleFinish={handleFinish}
          scores={scores}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="p-4 justify-between flex-1 bg-white dark:bg-black">
      <StatusBar style="light" animated />
      <View className="gap-4">
        <View className="items-center justify-center w-full flex-row gap-4">
          <DefaultView className="w-fit flex-row gap-1 items-center justify-center text-xl p-4 rounded-xl bg-transparent border-2 border-stone-300 dark:border-stone-800">
            <Text className="text-xl font-bold">
              {scores.reduce((a, b) => a + b, 0)}
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

        {!isMyTurn ? (
          <Text className="text-xl font-bold text-center">
            {peerName}'s turn!
          </Text>
        ) : (
          <Text className="text-xl font-bold text-center">
            {message || "Your turn!"}
          </Text>
        )}
      </View>

      <View className="gap-8">
        <ScrollView
          className="max-h-[30rem] sm:max-h-[20rem]"
          contentInsetAdjustmentBehavior="automatic"
          alwaysBounceVertical={false}
        >
          <DefaultText
            className={`text-2xl font-extrabold text-lime-700 dark:text-lime-500 pb-4 ${
              isMyTurn ? "" : "hidden"
            }`}
          >
            Say:
          </DefaultText>
          <View className="gap-2 flex-row flex-wrap">
            {content[currentSentenceIndex].split(" ").map((word, wordIdx) => (
              <Text
                key={`word-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  wordIdx
                }`}
                className={`font-bold text-5xl leading-tight ${
                  filteredFeedback().length === 0
                    ? "!text-inherit"
                    : filteredFeedback()[wordIdx]?.type !== "correct"
                      ? "!text-red-500"
                      : "!text-inherit"
                }`}
              >
                {word}
              </Text>
            ))}
          </View>
        </ScrollView>

        <View className="gap-4 shrink-0">
          <View className="w-full flex-row gap-4">
            <Pressable
              disabled={!isMyTurn}
              onPress={() => {
                Speech.speak(content[currentSentenceIndex], {
                  language: "en-UK",
                  rate: 0.5,
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
              disabled={!isMyTurn}
              onPress={handleSkipTurn}
              className="w-fit flex-1 h-20 items-center justify-center text-xl p-4 rounded-xl disabled:border-2 border-stone-300 dark:border-stone-800 bg-stone-200 dark:bg-stone-800 disabled:bg-transparent active:bg-stone-300 dark:active:bg-stone-700 group"
            >
              <DefaultText className="text-xl font-bold text-black dark:text-white group-disabled:text-stone-400">
                Skip Turn
              </DefaultText>
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
            onPressIn={handleStartRecording}
            onPressOut={handleStopRecording}
            disabled={isUploading || !isMyTurn}
            recording={recording !== undefined}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
