import { useRouter } from "expo-router";
import { useState } from "react";
import { View as DefaultView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SelectButton from "@/components/SelectButton";
import TextButton from "@/components/TextButton";
import { Text, View } from "@/components/Themed";
import type { Stories, StoryTheme } from "@/utils/types";

export default function StoryModeScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [selectedTheme, setSelectedTheme] = useState<StoryTheme>("animals");

	const storyThemes: { label: string; value: StoryTheme }[] = [
		{ label: "🐶  Animals", value: "animals" },
		{ label: "⚔  Adventure", value: "adventure" },
		{ label: "🧑  Friends", value: "friends" },
	];

	const stories: Stories = {
		animals: {
			title: "The Jungle Adventure",
			tags: "Adventure, Jungle, Treasure",
			description:
				"In a lush jungle, a brave tiger sets out on an adventure to find the hidden treasure. Join the tiger on this thrilling quest!",
			content: [
				"In a big green jungle, there lived a brave tiger named Tommy.",
				"One day, Tommy found an old map under a tree.",
				"The map showed a hidden treasure deep in the jungle!",
				"Tommy followed the map, crossing rivers and climbing rocks.",
				"Along the way, he met a clever monkey and a helpful parrot.",
				"Together, they found the treasure chest filled with shiny gold coins and sparkling jewels.",
				'"We did it!" said Tommy.',
				"The jungle animals cheered, and they all celebrated with a big feast.",
			],
		},
		adventure: {
			title: "The Mountain Quest",
			tags: "Adventure, Mountain, Exploration",
			description:
				"Scale the mighty mountains and uncover hidden secrets as you embark on an unforgettable journey.",
			content: [
				"Lila and her dog Max loved adventures.",
				"One sunny day, they decided to climb the big blue mountain.",
				"They packed sandwiches and water in a small bag.",
				"The path was steep and rocky, but Lila and Max didn’t give up.",
				"They saw pretty flowers and colorful birds on their way.",
				"At the top, they found a shiny stone that sparkled in the sunlight.",
				'"This is our lucky stone," said Lila.',
				"She and Max smiled as they enjoyed the view.",
				"It was a perfect day!",
			],
		},
		friends: {
			title: "The Friendship Tale",
			tags: "Friends, Cooperation, Fun",
			description:
				"Join a group of friends as they navigate challenges and celebrate victories together.",
			content: [
				"Ben, Mia, and Sam were best friends.",
				"One day, they found a broken swing in the park.",
				'"Let’s fix it!" said Mia.',
				"Ben brought a rope, and Sam found a strong board.",
				"They worked together, laughing and sharing ideas.",
				"Soon, the swing was ready.",
				"Ben pushed Mia, and Sam cheered.",
				"Other kids came to play too.",
				"Everyone had so much fun!",
				'Ben said, "Teamwork makes everything better."',
				"They all agreed, and their friendship grew even stronger.",
			],
		},
	};

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
