import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

const Scene07 = () => {
  const [reflection, setReflection] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = () => {
    if (!reflection) {
      Alert.alert("Input Missing", "Please enter or select a reflection before proceeding.");
      return;
    }
    Alert.alert("Reflection Submitted", "Thank you for sharing your thoughts!");
    router.push("/scene08");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scene 7: Reflection</Text>
      <Text style={styles.subtitle}>What did you learn or feel about the story?</Text>

      <TextInput
        style={styles.input}
        placeholder="Type your reflection here..."
        multiline
        onChangeText={(text) => setReflection(text)}
      />

      <TouchableOpacity
        style={styles.predefinedButton}
        onPress={() => setReflection("I learned the importance of perseverance.")}>
        <Text style={styles.predefinedText}>I learned the importance of perseverance.</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.predefinedButton}
        onPress={() => setReflection("Teamwork is the key to success.")}>
        <Text style={styles.predefinedText}>Teamwork is the key to success.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Reflection</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  predefinedButton: {
    backgroundColor: "#f4f4f4",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  predefinedText: { textAlign: "center", fontSize: 14 },
  submitButton: { backgroundColor: "black", padding: 15, borderRadius: 10, marginTop: 20 },
  submitButtonText: { color: "white", fontSize: 16, fontWeight: "bold", textAlign: "center" },
});

export default Scene07;
