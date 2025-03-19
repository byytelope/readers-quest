import { usePreventRemove } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, View as DefaultView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TextButton from "@/components/TextButton";
import { Text, View } from "@/components/Themed";
import { useAppContext } from "@/utils/appContext";
import { getAward } from "@/utils/helpers";
import { supabase } from "@/utils/supabase";
import { useSupabase } from "@/utils/supabaseContext";
import { useAudioRecorder } from "@/utils/useAudioRecorder";

const sampleContent = [
  "Hello, I'm happy to be reading with you today.",
  "Let's practice our reading skills together.",
  "We can take turns reading sentences.",
  "Reading with friends is fun and helps us improve faster.",
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
  const [isPeerDisconnect, setIsPeerDisconnect] = useState(false);
  const [activeTurnUserId, setActiveTurnUserId] = useState<string>(
    isHost === "true" ? userId : "",
  );

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
    const channelName = `peer_session:${sessionCode}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    console.log(`Subscribing to channel: ${channelName} as user: ${userId}`);

    let presenceTimeout: NodeJS.Timeout;
    let peerConnectionTimeout: NodeJS.Timeout;

    channel
      .on("presence", { event: "join" }, ({ newPresences }) => {
        console.log("Presence join event:", newPresences);

        const peer = newPresences.find(
          (presence) => presence.user_id !== userId,
        );

        if (peer) {
          console.log("Peer joined:", peer);
          setPeerName(peer.user_name || "Peer");
          setPeerId(peer.user_id);
          setIsConnected(true);

          // For host only: Broadcast initial turn state when peer joins
          if (isHost === "true") {
            // Small delay to ensure both sides are ready
            setTimeout(async () => {
              try {
                await supabase.channel(`peer_session:${sessionCode}`).send({
                  type: "broadcast",
                  event: "turn_change",
                  payload: {
                    nextTurn: userId, // Host goes first
                    sentenceIndex: 0,
                  },
                });

                console.log("Initial turn state broadcast sent by host");
              } catch (error) {
                console.error("Error sending initial turn state:", error);
              }
            }, 1000);
          }

          if (peerConnectionTimeout) {
            clearTimeout(peerConnectionTimeout);
          }
        }
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        console.log("Presence leave event:", leftPresences);

        const peerLeft = leftPresences.find(
          (presence) => presence.user_id !== userId,
        );

        if (peerLeft && isConnected && !isCompleted) {
          console.log("Peer disconnected:", peerLeft);
          peerConnectionTimeout = setTimeout(() => {
            if (peerId && isConnected && !isCompleted) {
              Alert.alert(
                "Peer disconnected",
                "Your reading partner has left the session.",
                [
                  {
                    text: "Return to Home",
                    onPress: safeNavigateToHome,
                  },
                ],
              );
            }
          }, 3000);
        }
      })
      .on("broadcast", { event: "turn_change" }, ({ payload }) => {
        console.log("Turn change event received:", payload);

        // IMPORTANT: Always respect the broadcast value
        const nextTurn = payload.nextTurn;
        const nextSentence = payload.sentenceIndex;

        console.log(`Turn changing to: ${nextTurn}, my ID: ${userId}`);
        console.log(`Is it my turn now? ${nextTurn === userId}`);

        // Update state based on the broadcast
        setActiveTurnUserId(nextTurn);
        setCurrentSentenceIndex(nextSentence);
      })
      .on("broadcast", { event: "session_complete" }, () => {
        setIsCompleted(true);
        animationRef.current?.play();
      })
      .on("broadcast", { event: "peer_disconnect" }, () => {
        if (isConnected && !isCompleted) {
          console.log("Received peer_disconnect broadcast");
          Alert.alert(
            "Peer disconnected",
            "Your reading partner has left the session.",
            [
              {
                text: "Return to Home",
                onPress: safeNavigateToHome,
              },
            ],
          );
        }
      });

    channel.subscribe(async (status) => {
      console.log(`Channel status: ${status}`);

      if (status === "SUBSCRIBED") {
        presenceTimeout = setTimeout(async () => {
          try {
            await channel.track({
              user_id: userId,
              user_name: user?.name || "Reader",
              online_at: new Date().toISOString(),
            });
            console.log(`Tracked presence for user: ${userId}`);
          } catch (error) {
            console.error("Error tracking presence:", error);
          }
        }, 1000);
      }
    });

    return () => {
      clearTimeout(presenceTimeout);
      clearTimeout(peerConnectionTimeout);

      if (isConnected && !isCompleted) {
        console.log("Sending disconnect broadcast");
        channel
          .send({
            type: "broadcast",
            event: "peer_disconnect",
            payload: { userId },
          })
          .then(() => {
            channel.untrack().then(() => {
              console.log(`Untracked presence for user: ${userId}`);
              channel.unsubscribe();
              console.log(`Unsubscribed from channel: ${channelName}`);
            });
          });
      } else {
        channel.untrack().then(() => {
          console.log(`Untracked presence for user: ${userId}`);
          channel.unsubscribe();
          console.log(`Unsubscribed from channel: ${channelName}`);
        });
      }
    };
  }, [
    sessionCode,
    userId,
    user?.name,
    isConnected,
    isCompleted,
    peerId,
    isHost,
  ]);

  useEffect(() => {
    if (isCompleted && getGrade(content.length) >= 0.5) {
      animationRef.current?.play();
    }
  }, [isCompleted, content.length, getGrade]);

  useEffect(() => {
    console.log(`activeTurnUserId changed to: ${activeTurnUserId}`);
    console.log(`Is this my turn? ${activeTurnUserId === userId}`);
    setIsMyTurn(activeTurnUserId === userId);
  }, [activeTurnUserId, userId]);

  useEffect(() => {
    // Only for host: Set up initial turn state after connection
    if (isConnected && isHost === "true" && peerId) {
      console.log("Host initializing turn state");

      // Explicitly broadcast initial turn state
      const initializeTurn = async () => {
        try {
          await supabase.channel(`peer_session:${sessionCode}`).send({
            type: "broadcast",
            event: "turn_change",
            payload: {
              nextTurn: userId, // Host starts
              sentenceIndex: 0,
            },
          });
        } catch (error) {
          console.error("Error initializing turn state:", error);
        }
      };

      initializeTurn();
    }
  }, [isConnected, isHost, peerId, userId, sessionCode]);

  usePreventRemove(!isPeerDisconnect && !isCompleted, ({ data }) => {
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

  const safeNavigateToHome = () => {
    setIsPeerDisconnect(true);
    setTimeout(() => {
      router.dismissTo("/(protected)/home");
    }, 100);
  };

  const handleStartRecording = async () => {
    if (!isMyTurn) return;

    await record(
      content[currentSentenceIndex],
      `${process.env.EXPO_PUBLIC_SERVER_URL}:8000/grade`,
      (res) => {
        updateState("frustrated", res.frustrated);
        if (res.grade >= 0.8) {
          setFeedback([]);
          handleNextTurn();
        } else {
          Speech.speak("Almost there...Try again!", {
            language: "en-UK",
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
      await supabase.channel(`peer_session:${sessionCode}`).send({
        type: "broadcast",
        event: "session_complete",
        payload: {},
      });

      setIsCompleted(true);
      return;
    }

    if (!peerId) {
      console.error("No peer connected, cannot switch turns");
      return;
    }

    // Explicitly determine who should go next
    const nextTurnUserId = activeTurnUserId === userId ? peerId : userId;

    console.log(
      `Current turn: ${activeTurnUserId}, Next turn: ${nextTurnUserId}`,
    );

    try {
      // Update local state first to prevent race conditions
      setActiveTurnUserId(nextTurnUserId);

      // Then broadcast the change
      await supabase.channel(`peer_session:${sessionCode}`).send({
        type: "broadcast",
        event: "turn_change",
        payload: {
          nextTurn: nextTurnUserId,
          sentenceIndex: newIndex,
        },
      });
    } catch (error) {
      console.error("Error sending turn change:", error);
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
    }
  };

  return (
    <SafeAreaView className="p-4 justify-between flex-1 bg-white dark:bg-black">
      <StatusBar style="light" animated />
      {isCompleted ? (
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
        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold mb-4">Waiting for peer...</Text>
          <Text className="text-lg text-center mb-8">
            Share the session code with your peer:
          </Text>
          <Text className="text-4xl font-bold mb-8">{sessionCode}</Text>
        </View>
      ) : !isConnected ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold mb-4">Connecting...</Text>
          <Text className="text-lg text-center">
            Joining session {sessionCode}
          </Text>
        </View>
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
