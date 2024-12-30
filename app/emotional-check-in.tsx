import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useState, forwardRef } from "react";
import { StyleSheet, Pressable, Alert } from "react-native";

import Button from "@/components/Button";
import { View, Text } from "@/components/Themed";

const EmotionalCheckInModal = forwardRef(
  (_, ref: React.ForwardedRef<BottomSheetModal>) => {
    const [selectedEmotion, setSelectedEmotion] = useState("");
    const [negativeEmotionCount, setNegativeEmotionCount] = useState(0);
    const router = useRouter();

    const emotions = [
      { label: "😄", value: "happy" },
      { label: "🙂", value: "okay" },
      { label: "☹", value: "sad" },
    ];

    const handleSubmit = () => {
      if (!selectedEmotion) {
        Alert.alert(
          "Select an emotion",
          "Please select an emotion before submitting.",
        );
        return;
      }

      if (selectedEmotion === "sad") {
        setNegativeEmotionCount((prev) => prev + 1);
      } else {
        setNegativeEmotionCount(0); // Reset if positive/neutral emotion is selected
      }

      if (negativeEmotionCount >= 2 && selectedEmotion === "sad") {
        Alert.alert(
          "Feeling Sad?",
          "Would you like to try a calming breathing exercise?",
          [
            { text: "No, Thanks" },
            {
              text: "Yes, Please",
              onPress: () => console.log("Navigate to breathing exercise"),
            },
          ],
        );
      } else {
        router.dismissTo("/");
      }
    };

    return (
      <BottomSheetModalProvider>
        <BottomSheetModal ref={ref}>
          <View style={styles.container}>
            <Text style={styles.title}>Emotional Check-In</Text>
            <Text style={styles.subtitle}>
              How do you feel about the exercise?
            </Text>

            <Text style={styles.instruction}>Select an emotion below:</Text>
            <Text style={styles.description}>
              Choose from the icons that best represent how you feel after the
              exercise.
            </Text>

            <View style={styles.emotionsContainer}>
              {emotions.map((emotion) => (
                <Pressable
                  key={emotion.value}
                  style={[
                    styles.emotionButton,
                    selectedEmotion === emotion.value &&
                      styles.emotionButtonSelected,
                  ]}
                  onPress={() => setSelectedEmotion(emotion.value)}
                >
                  <Text style={styles.emotionLabel}>{emotion.label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.footerText}>
              Select the icon that best matches your current feeling.
            </Text>
            <Button text="Submit" onPress={handleSubmit} />
          </View>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  instruction: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "gray",
    marginBottom: 20,
  },
  emotionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  emotionButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  emotionButtonSelected: {
    borderColor: "blue",
    backgroundColor: "#d0e7ff",
  },
  emotionLabel: {
    fontSize: 16,
    textAlign: "center",
  },
  footerText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EmotionalCheckInModal;
