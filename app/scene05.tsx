import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

const Scene05 = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = () => {
    if (!selectedAnswer) {
      Alert.alert("Select an answer", "Please choose an option before continuing.");
      return;
    }
    Alert.alert("Quiz Submitted", `You chose: ${selectedAnswer}`);
    router.push("/scene06");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scene 5: Quiz</Text>
      <Text style={styles.subtitle}>What do you think was the lesson of the story?</Text>

      {["Courage", "Teamwork", "Kindness", "Perseverance"].map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.optionButton,
            selectedAnswer === option && styles.selectedOption,
          ]}
          onPress={() => setSelectedAnswer(option)}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  optionButton: { padding: 15, marginVertical: 5, borderWidth: 1, borderRadius: 8, width: "80%" },
  selectedOption: { backgroundColor: "#d0e7ff", borderColor: "blue" },
  optionText: { textAlign: "center", fontSize: 16 },
  submitButton: { backgroundColor: "black", padding: 15, borderRadius: 10, marginTop: 20 },
  submitButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default Scene05;
