/**
 * ReadingScreen component
 * 
 * This component is used to display the story details and allow the user to finish reading the story.
 * It receives the story details from the navigation params and displays them in a scrollable view.
 * If the story details are not present, it will display an error message and a back button to navigate back to the previous screen.
 * 
 * @prop {Object} params - The navigation params containing the story details.
 * @prop {Object} story - The story details to be displayed.
 * @prop {string} title - The title of the story.
 * @prop {string} tags - The tags associated with the story.
 * @prop {string} description - A brief description of the story.
 */
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "expo-router";

const ReadingScreen = () => {
  const navigation = useNavigation();
  const { params } = navigation.getState().routes.find(route => route.name === "readingScreen") || {};
  const { story } = params || {}; // Retrieve the story details from navigation params

  if (!story) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No story data available.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{story.title}</Text>
      <Text style={styles.tags}>{story.tags}</Text>
      <Text style={styles.description}>{story.description}</Text>

      <Text style={styles.storyText}>
        Once upon a time, in a world filled with endless possibilities, {story.title.toLowerCase()} began...
      </Text>

      {/* Finish Button */}
      <TouchableOpacity style={styles.finishButton} onPress={() => navigation.goBack()}>
        <Text style={styles.finishButtonText}>Finish</Text>
      </TouchableOpacity>

      {/* Go to Emotional Check-In Button */}
      <TouchableOpacity
        style={styles.emotionCheckButton}
        onPress={() => navigation.navigate("scene03")}
      >
        <Text style={styles.emotionCheckButtonText}>Go to Emotional Check-In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

/**
 * Styles for the ReadingScreen component
 */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  tags: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "justify",
    marginBottom: 20,
  },
  finishButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  finishButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  emotionCheckButton: {
    backgroundColor: "blue",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  emotionCheckButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: "gray",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ReadingScreen;
