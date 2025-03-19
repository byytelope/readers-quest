import Ionicons from "@expo/vector-icons/Ionicons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
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
import { getAward } from "@/utils/helpers";
import { useSupabase } from "@/utils/supabaseContext";
import { supabase } from "@/utils/supabase";
import { useAudioRecorder } from "@/utils/useAudioRecorder";

// Sample text for reading - in a real app, this would come from a database
const sampleReadingText = [
	"Once upon a time, there was a little girl who lived in a village near the forest.",
	"She was the sweetest little girl that had ever been seen.",
	"Her mother was very fond of her, and her grandmother loved her even more.",
	"To show her love, the grandmother had made her a red riding hood.",
	"The girl loved it so much that she wore it all the time.",
	"That's why everyone called her Little Red Riding Hood.",
];

export default function PeerReadingScreen() {
	const { sessionCode, isHost, userId } = useLocalSearchParams();
	const navigation = useNavigation();
	const router = useRouter();
	const colorScheme = useColorScheme();
	const { user } = useSupabase();
	const { state } = useAppContext();

	const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
	const [peerTurn, setPeerTurn] = useState(!isHost);
	const [peerStatus, setPeerStatus] = useState("waiting");
	const [peerName, setPeerName] = useState("Peer");
	const [readingComplete, setReadingComplete] = useState(false);
	const [scores, setScores] = useState<number[]>([]);
	const [peerConnected, setPeerConnected] = useState(false);

	const {
		record,
		stopRecording,
		isUploading,
		recording,
		feedback,
		setFeedback,
		getGrade,
		message,
	} = useAudioRecorder();

	// Set up Supabase real-time subscription
	useEffect(() => {
		if (!sessionCode || !userId) return;

		const channel = supabase.channel(`reading-session-${sessionCode}`)
			.on("broadcast", { event: "reading-turn" }, ({ payload }) => {
				if (payload.userId !== userId) {
					setPeerConnected(true);
					setPeerTurn(payload.isMyTurn);
					if (payload.currentIndex !== undefined) {
						setCurrentSentenceIndex(payload.currentIndex);
					}
					if (payload.status) {
						setPeerStatus(payload.status);
					}
					if (payload.score !== undefined) {
						setScores((prev) => [...prev, payload.score]);
					}
				}
			})
			.on("broadcast", { event: "session-complete" }, () => {
				setReadingComplete(true);
			})
			.on("broadcast", { event: "peer-joined" }, ({ payload }) => {
				if (payload.userId !== userId) {
					setPeerConnected(true);
				}
			})
			.subscribe();

		// If non-host (peer), send join notification immediately
		if (isHost === "false") {
			supabase.channel(`reading-session-${sessionCode}`).send({
				type: "broadcast",
				event: "peer-joined",
				payload: { userId },
			});
		}

		return () => {
			supabase.removeChannel(channel);
		};
	}, [sessionCode, userId, isHost]);

	// Send updates to peer
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const notifyPeer = useCallback((data: any) => {
		if (!sessionCode) return;

		supabase.channel(`reading-session-${sessionCode}`)
			.send({
				type: "broadcast",
				event: "reading-turn",
				payload: {
					...data,
					userId: userId,
				},
			});
	}, [sessionCode, userId]);

	// Handle recording and grading
	const handleStartRecording = async () => {
		await record(
			sampleReadingText[currentSentenceIndex],
			`${process.env.EXPO_PUBLIC_SERVER_URL}:8000/grade`,
			(res) => {
				if (res.grade >= 0.8) {
					setFeedback([]);
					const newScore = Math.round(res.grade * 100);
					setScores((prev) => [...prev, newScore]);

					if (currentSentenceIndex + 1 >= sampleReadingText.length) {
						setReadingComplete(true);
						supabase.channel(`reading-session-${sessionCode}`)
							.send({
								type: "broadcast",
								event: "session-complete",
								payload: {},
							});
					} else {
						const nextIndex = currentSentenceIndex + 1;
						setCurrentSentenceIndex(nextIndex);
						setPeerTurn(true);
						notifyPeer({
							isMyTurn: true,
							currentIndex: nextIndex,
							status: "completed",
							score: newScore,
						});
					}
				} else {
					notifyPeer({
						status: "retrying",
					});
				}
			},
		);
	};

	const handleStopRecording = async () => {
		await stopRecording();
	};

	const handleSkipTurn = () => {
		if (currentSentenceIndex + 1 >= sampleReadingText.length) {
			setReadingComplete(true);
			supabase.channel(`reading-session-${sessionCode}`)
				.send({
					type: "broadcast",
					event: "session-complete",
					payload: {},
				});
		} else {
			const nextIndex = currentSentenceIndex + 1;
			setCurrentSentenceIndex(nextIndex);
			setPeerTurn(true);
			notifyPeer({
				isMyTurn: true,
				currentIndex: nextIndex,
				status: "skipped",
			});
		}
	};

	const handleFinish = async () => {
		router.dismissTo("/(protected)/home");
	};

	// If host is waiting for peer to connect, show waiting screen
	if (isHost === "true" && !peerConnected) {
		return (
			<SafeAreaView className="p-4 justify-between flex-1 bg-white dark:bg-black">
				<StatusBar style="light" animated />
				<View className="gap-8 items-center justify-between flex-1">
					<View className="items-center justify-center gap-4 flex-1">
						<Text className="text-4xl font-bold text-center">
							Waiting to Connect
						</Text>
						<Text className="text-xl text-center">
							Share this code with your reading partner
						</Text>
						<View className="bg-stone-200 dark:bg-stone-800 px-8 py-6 rounded-xl justify-center items-center">
							<Text className="text-5xl font-bold tracking-wider text-center">
								{sessionCode}
							</Text>
						</View>
					</View>
					<TextButton
						text="Cancel"
						onPress={() => router.back()}
					/>
				</View>
			</SafeAreaView>
		);
	}

	if (readingComplete) {
		const totalScore = scores.reduce((a, b) => a + b, 0);
		const averageGrade = scores.length > 0
			? totalScore / scores.length / 100
			: 0;

		return (
			<SafeAreaView className="p-4 justify-between flex-1 bg-white dark:bg-black">
				<StatusBar style="light" animated />
				<View className="gap-4 items-center justify-center flex-1">
					<Text className="text-6xl pt-2">
						{getAward(averageGrade).emoji}
					</Text>
					<Text className="text-4xl font-bold text-center w-full">
						Reading Session Complete!
					</Text>
					<Text className="text-2xl text-center">
						Your total score is {totalScore} points.
					</Text>
				</View>
				<TextButton text="Finish" onPress={handleFinish} />
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
						<Text className="text-xl font-bold">
							{sampleReadingText.length}
						</Text>
					</DefaultView>
				</View>

				{peerTurn
					? (
						<Text className="text-xl font-bold text-center text-blue-500">
							{peerName}'s turn!{" "}
							{peerStatus === "retrying" ? "(Retrying...)" : ""}
						</Text>
					)
					: (
						<Text className="text-xl font-bold text-center">
							{message || "Your turn!"}
						</Text>
					)}
			</View>

			<View className="gap-8">
				<ScrollView
					className="max-h-[30rem] sm:max-h-[20rem]"
					alwaysBounceVertical={false}
				>
					<DefaultText className="text-2xl font-extrabold text-lime-700 dark:text-lime-500 pb-4">
						Read:
					</DefaultText>
					<View className="gap-2 flex-row flex-wrap">
						{sampleReadingText[currentSentenceIndex].split(" ").map(
							(word, wordIdx) => (
								<Text
									key={`word-${
										// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
										wordIdx}`}
									className="font-bold text-5xl leading-tight"
								>
									{word}
								</Text>
							),
						)}
					</View>
				</ScrollView>

				<View className="gap-4 shrink-0">
					<View className="w-full flex-row gap-4">
						<Pressable
							disabled={peerTurn}
							onPress={() => {
								Speech.speak(
									sampleReadingText[currentSentenceIndex],
									{
										language: "en-UK",
										rate: 0.5,
									},
								);
							}}
							className="w-fit min-w-24 h-20 items-center justify-center text-xl p-4 rounded-xl disabled:border-2 border-stone-300 dark:border-stone-800 bg-stone-200 dark:bg-stone-800 disabled:bg-transparent active:bg-stone-300 dark:active:bg-stone-700 group"
						>
							<Ionicons
								name="ear-outline"
								size={32}
								color={colorScheme === "dark"
									? "white"
									: "black"}
							/>
						</Pressable>
						<Pressable
							disabled={peerTurn}
							onPress={handleSkipTurn}
							className="w-fit flex-1 h-20 items-center justify-center text-xl p-4 rounded-xl disabled:border-2 border-stone-300 dark:border-stone-800 bg-stone-200 dark:bg-stone-800 disabled:bg-transparent active:bg-stone-300 dark:active:bg-stone-700 group"
						>
							<DefaultText className="text-xl font-bold text-black dark:text-white group-disabled:text-stone-400">
								Skip Turn
							</DefaultText>
						</Pressable>
					</View>
					<TextButton
						text={recording !== undefined
							? "Listening..."
							: isUploading
							? "Checking..."
							: "Hold and Speak"}
						onPressIn={handleStartRecording}
						onPressOut={handleStopRecording}
						disabled={isUploading || peerTurn}
						recording={recording !== undefined}
					/>
				</View>
			</View>
		</SafeAreaView>
	);
}
