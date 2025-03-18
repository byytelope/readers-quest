import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import ReadingScreen from "@/components/ReadingScreen";
import TextButton from "@/components/TextButton";
import type { Story } from "@/utils/types";

export default function StoryReadingScreen() {
  const { story: storyString } = useLocalSearchParams<{ story: string }>();
  const router = useRouter();
  const [story, setStory] = useState<Story>();

  useEffect(() => {
    const _story: Story = JSON.parse(storyString);
    setStory(_story);
  }, [storyString]);

  return story ? (
    <ReadingScreen content={story.content} />
  ) : (
    <TextButton text="Go Back" onPress={() => router.back()} />
  );
}
