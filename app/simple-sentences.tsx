import ReadingScreen from "@/components/ReadingScreen";
import { sentences } from "@/utils/types";

export default function SimpleSentencesScreen() {
  return <ReadingScreen content={sentences} />;
}
