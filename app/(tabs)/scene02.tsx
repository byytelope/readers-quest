import React from "react";
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useNavigation } from 'expo-router';

const Scene02 = () => {
  const navigation = useNavigation();

  const sentences = [
    "The cat is on the mat.",
    "I like ice cream.",
    "She has a red balloon.",
  ];

  const handleFinish = () => {
    Alert.alert("Great Job!", "You've completed the practice.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple Sentence Practice</Text>
      <Text style={styles.subtitle}>Practice with me and improve your pronunciation!</Text>
      <View style={styles.sentencesContainer}>
        {sentences.map((sentence, index) => (
          <View key={index} style={styles.sentenceBox}>
            <Text style={styles.sentenceText}>
              <Text style={styles.boldText}>AI:</Text> {sentence}
            </Text>
            <Text style={styles.sentenceText}>
              <Text style={styles.boldText}>User:</Text> (Your response)
            </Text>
          </View>
        ))}
      </View>
      <Button title="Finish" onPress={handleFinish} />
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('scene03')}>
        <Text style={styles.navButtonText}>Go to Emotional Check-In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff", // Set background color to white
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  sentencesContainer: {
    width: "100%",
    marginBottom: 20,
  },
  sentenceBox: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  sentenceText: {
    fontSize: 16,
  },
  boldText: {
    fontWeight: "bold",
  },
  navButton: {
    marginTop: 20,
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  navButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Scene02;
