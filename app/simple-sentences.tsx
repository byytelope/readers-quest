import ReadingScreen from "@/components/ReadingScreen";

export default function SimpleSentencesScreen() {
  const sentences = [
    "The cat is on the mat.",
    "I like ice cream.",
    "She has a red balloon.",
  ];

  return (
    <ReadingScreen
      content={sentences}
      title="Simple Sentences"
      subtitle="Pronounce perfectly to find an animal friend!"
    />
  );
}
