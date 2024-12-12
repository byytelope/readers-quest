import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";

const Scene01 = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null); // Track the selected avatar
  const router = useRouter(); // Hook for navigation

  const avatars = ["Cat", "Robot", "Bear", "Unicorn"]; // List of available avatars

  const handleAvatarClick = (avatar: string) => {
    setSelectedAvatar(avatar); // Update selected avatar
  };

  const handleContinue = () => {
    if (selectedAvatar) {
      router.push("/scene02"); // Navigate to Scene 2
    } else {
      Alert.alert("Select an Avatar", "Please select an avatar to continue!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reading Adventure</Text>
      <Text style={styles.subtitle}>Select your avatar and get ready for the adventure!</Text>
      <View style={styles.avatarContainer}>
        {avatars.map((avatar) => (
          <TouchableOpacity
            key={avatar}
            onPress={() => handleAvatarClick(avatar)}
            style={[
              styles.avatarButton,
              selectedAvatar === avatar && styles.selectedAvatar,
            ]}
          >
            <Text style={styles.avatarText}>{avatar}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button title="Continue" onPress={handleContinue} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
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
  avatarContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  avatarButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    marginHorizontal: 5,
  },
  selectedAvatar: {
    borderColor: "blue",
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 16,
  },
});

export default Scene01;
