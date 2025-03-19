import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, View as DefaultView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import { usePreventRemove } from "@react-navigation/native";
import LottieView from "lottie-react-native";

import { Text, View } from "@/components/Themed";
import TextButton from "@/components/TextButton";
import { useSupabase } from "@/utils/supabaseContext";
import { supabase } from "@/utils/supabase";
import { useAppContext } from "@/utils/appContext";
import { useAudioRecorder } from "@/utils/useAudioRecorder";
import { getAward } from "@/utils/helpers";

// Sample content - in a real app, you would fetch or generate this
const sampleContent = [
  "Hello, I'm happy to be reading with you today.",
  "Let's practice our reading skills together.",
  "We can take turns reading sentences.",
  "Reading with friends is fun and helps us improve faster.",
];

export default function PeerReadingScreen() {
  const params = useLocalSearchParams();
  const { sessionCode, isHost, userId } = params;
  const navigation = useNavigation();
  const router = useRouter();
  const { user, updateUser } = useSupabase();
  const { updateState } = useAppContext();
  const animationRef = useRef<LottieView>(null);

  const [peerName, setPeerName] = useState<string | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [content, _setContent] = useState<string[]>(sampleContent);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(isHost === "true");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

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

  // Set up Supabase realtime subscription
  useEffect(() => {
    const channel = supabase.channel(`peer_session:${sessionCode}`);

    // Handle connection events
    channel
      .on("presence", { event: "join" }, ({ newPresences }) => {
        // Someone joined
        const peer = newPresences.find(
          (presence) => presence.user_id !== userId,
        );
        if (peer) {
          setPeerName(peer.user_name || "Peer");
          setPeerId(peer.user_id);
          setIsConnected(true);
        }
      })
      .on("presence", { event: "leave" }, () => {
        // Handle peer disconnect
        if (isConnected && !isCompleted) {
          Alert.alert(
            "Peer disconnected",
            "Your reading partner has left the session.",
          );
        }
      })
      // Handle turn changes
      .on("broadcast", { event: "turn_change" }, ({ payload }) => {
        setIsMyTurn(payload.nextTurn === userId);
        setCurrentSentenceIndex(payload.sentenceIndex);
      })
      // Handle session completion
      .on("broadcast", { event: "session_complete" }, () => {
        setIsCompleted(true);
        animationRef.current?.play();
      });

    // Track presence
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: userId,
          user_name: user?.name || "Reader",
        });
      }
    });

    // Cleanup
    return () => {
      channel.unsubscribe();
    };
  }, [sessionCode, userId, user?.name, isConnected, isCompleted]);

  useEffect(() => {
    if (isCompleted && getGrade(content.length) >= 0.5) {
      animationRef.current?.play();
    }
  }, [isCompleted, content.length, getGrade]);

  // Prevent accidental navigation away
  usePreventRemove(!isCompleted, ({ data }) => {
    Alert.alert(
      "Leave reading session?",
      "Your progress will be lost and your peer will be disconnected.",
      [
        { text: "Stay", style: "cancel", onPress: () => {} },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => navigation.dispatch(data.action),
        },
      ],
    );
  });

  const handleStartRecording = async () => {
    if (!isMyTurn) return;

    await record(
      content[currentSentenceIndex],
      // "http://localhost:8000/grade", // Update with your API endpoint
      "http://192.168.100.170:8000/grade",
      (res) => {
        updateState("frustrated", res.frustrated);
        if (res.grade >= 0.8) {
          setFeedback([]);
          // Move to next turn
          handleNextTurn();
        } else {
          Speech.speak("Almost there...Try again!", {
            language: "en-UK",
            onDone: () => {},
          });
        }
      },
    );
  };

  const handleStopRecording = async () => {
    await stopRecording();
  };

  const handleNextTurn = async () => {
    const newIndex = currentSentenceIndex + 1;

    if (newIndex >= content.length) {
      // Session complete
      await supabase.channel(`peer_session:${sessionCode}`).send({
        type: "broadcast",
        event: "session_complete",
        payload: {},
      });

      setIsCompleted(true);
      return;
    }

    // Switch turns
    const nextTurnUserId = isMyTurn ? peerId : userId;

    await supabase.channel(`peer_session:${sessionCode}`).send({
      type: "broadcast",
      event: "turn_change",
      payload: {
        nextTurn: nextTurnUserId,
        sentenceIndex: newIndex,
      },
    });
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
    }
  };

  return (
    <SafeAreaView className="p-4 justify-between flex-1 bg-white dark:bg-black">
      <StatusBar style="light" animated />
      {isCompleted ? (
        // Show completion screen
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
                display: getGrade(content.length) >= 0.5 ? "flex" : "none",
              }}
              autoPlay={false}
            />
            <Text className="text-6xl pt-2">
              {getAward(getGrade(content.length)).emoji}
            </Text>
            <Text className="text-4xl font-bold text-center w-full">
              {getAward(getGrade(content.length)).message}
            </Text>
            <Text className="text-2xl text-center">
              Your total score is {scores.reduce((i, j) => i + j, 0)} points.
            </Text>
          </View>
          <TextButton text="Finish" onPress={handleFinish} />
        </>
      ) : !isConnected && isHost === "true" ? (
        // Waiting for peer to join
        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold mb-4">Waiting for peer...</Text>
          <Text className="text-lg text-center mb-8">
            Share the session code with your peer:
          </Text>
          <Text className="text-4xl font-bold mb-8">{sessionCode}</Text>
        </View>
      ) : !isConnected ? (
        // Connecting to host
        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold mb-4">Connecting...</Text>
          <Text className="text-lg text-center">
            Joining session {sessionCode}
          </Text>
        </View>
      ) : (
        // Active reading session
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

            <View className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4 mb-2">
              <Text className="text-sm text-stone-500 dark:text-stone-400 mb-1">
                {isMyTurn ? "Your turn" : `${peerName || "Peer"}'s turn`}
              </Text>
            </View>

            <Text className="text-xl font-bold text-center">{message}</Text>
          </View>

          <View className="gap-8 flex-1">
            <ScrollView className="max-h-[26rem]" alwaysBounceVertical={false}>
              <DefaultView className="text-2xl font-extrabold text-lime-700 dark:text-lime-500 pb-4">
                <Text className="text-2xl font-extrabold text-lime-700 dark:text-lime-500">
                  {isMyTurn ? "Say:" : "Listen:"}
                </Text>
              </DefaultView>
              <View className="gap-2 flex-row flex-wrap">
                {content[currentSentenceIndex]
                  .split(" ")
                  .map((word, wordIdx) => (
                    <Text
                      key={`word-${
                        // biome-ignore lint/suspicious/noArrayIndexKey: shh
                        wordIdx
                      }`}
                      className={`font-bold text-5xl leading-tight ${
                        feedback.length === 0 || !isMyTurn
                          ? "!text-inherit"
                          : feedback[wordIdx]?.type !== "correct"
                            ? "!text-red-500"
                            : "!text-inherit"
                      }`}
                    >
                      {word}
                    </Text>
                  ))}
              </View>
            </ScrollView>

            {isMyTurn && (
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
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
