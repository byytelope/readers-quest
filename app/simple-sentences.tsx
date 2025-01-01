import ReadingScreen from "@/components/ReadingScreen";
import { sentences } from "@/utils/types";

export default function SimpleSentencesScreen() {
  return (
    <ReadingScreen
      content={sentences}
      title="Simple Sentences"
      subtitle="Pronounce perfectly to find an animal friend!"
    />
  );
}
