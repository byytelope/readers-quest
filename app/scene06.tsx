import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

const Scene06 = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (!selectedImage) {
      Alert.alert("Select an image", "Please choose an image before continuing.");
      return;
    }
    router.push("/scene07");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scene 6: Select an Image</Text>
      <Text style={styles.subtitle}>Choose the image that resonates with the story.</Text>

      <View style={styles.imageContainer}>
        {["Bear", "Tiger", "Elephant", "Giraffe"].map((animal) => (
          <TouchableOpacity
            key={animal}
            onPress={() => setSelectedImage(animal)}
            style={[
              styles.imageWrapper,
              selectedImage === animal && styles.selectedImage,
            ]}
          >
            <Image
              source={require(`@/assets/images/${animal} icon.png`)}
              style={styles.image}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  imageContainer: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
  imageWrapper: { padding: 10, borderWidth: 1, borderRadius: 10 },
  selectedImage: { borderColor: "blue", backgroundColor: "#d0e7ff" },
  image: { width: 50, height: 50 },
  continueButton: { backgroundColor: "black", padding: 15, borderRadius: 10, marginTop: 20 },
  continueButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default Scene06;
