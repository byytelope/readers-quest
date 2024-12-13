/**
 * Scene 4: Story mode
 *
 * This scene allows the user to select a story theme and start reading the story.
 * The user can select from three themes: animals, adventure, and friends.
 * The selected theme determines the story title, tags, and description that are displayed.
 * The user can then start reading the story by pressing the "Start Reading" button.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from 'expo-router';

const Scene04 = () => {
  const [selectedTheme, setSelectedTheme] = useState("animals"); // Default theme is "animals"
  const navigation = useNavigation();

  /**
   * Array of story themes
   */
  const themes = [
    { label: "Animals", value: "animals" },
    { label: "Adventure", value: "adventure" },
    { label: "Friends", value: "friends" },
  ];

  /**
   * Object containing the story data for each theme
   */
  const story = {
    animals: {
      title: "The Jungle Adventure",
      tags: "Adventure, Jungle, Treasure",
      description: "In a lush jungle, a brave tiger sets out on an adventure to find the hidden treasure. Join the tiger on this thrilling quest!",
    },
    adventure: {
      title: "The Mountain Quest",
      tags: "Adventure, Mountain, Exploration",
      description: "Scale the mighty mountains and uncover hidden secrets as you embark on an unforgettable journey.",
    },
    friends: {
      title: "The Friendship Tale",
      tags: "Friends, Cooperation, Fun",
      description: "Join a group of friends as they navigate challenges and celebrate victories together.",
    },
  };

  /**
   * Handles theme selection
   * @param theme The selected theme
   */
  const handleThemeSelect = (theme: React.SetStateAction<string>) => {
    setSelectedTheme(theme);
  };

  /**
   * Handles starting the reading experience
   */
  const handleStartReading = () => {
    (navigation.navigate as any)('readingScreen', { story: story[selectedTheme] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Story Mode</Text>
      <Text style={styles.subtitle}>Get ready for an exciting story!</Text>

      <Text style={styles.sectionTitle}>Choose Theme</Text>
      <View style={styles.themeContainer}>
        {themes.map((theme) => (
          <TouchableOpacity
            key={theme.value}
            style={[
              styles.themeButton,
              selectedTheme === theme.value && styles.themeButtonSelected,
            ]}
            onPress={() => handleThemeSelect(theme.value)}
          >
            <Text
              style={[
                styles.themeLabel,
                selectedTheme === theme.value && styles.themeLabelSelected,
              ]}
            >
              {theme.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Selected Theme: {themes.find(t => t.value === selectedTheme)?.label}</Text>
      <View style={styles.storyContainer}>
        <Text style={styles.storyTitle}>{story[selectedTheme].title}</Text>
        <Text style={styles.storyTags}>{story[selectedTheme].tags}</Text>
        <Text style={styles.storyDescription}>{story[selectedTheme].description}</Text>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={handleStartReading}>
        <Text style={styles.startButtonText}>Start Reading</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Styles for the scene
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  themeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  themeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  themeButtonSelected: {
    borderColor: "blue",
    backgroundColor: "#d0e7ff",
  },
  themeLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  themeLabelSelected: {
    fontWeight: "bold",
    color: "blue",
  },
  storyContainer: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: 20,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  storyTags: {
    fontSize: 14,
    color: "gray",
    marginBottom: 10,
  },
  storyDescription: {
    fontSize: 14,
  },
  startButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  startButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Scene04;
