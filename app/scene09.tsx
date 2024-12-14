import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

const Scene09 = () => {
  const router = useRouter();

  const handleRestart = () => {
    Alert.alert("Restarting", "Returning to the beginning...");
    router.push("/scene01");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Congratulations!</Text>
      <Text style={styles.subtitle}>You’ve completed the adventure.</Text>

      <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
        <Text style={styles.restartButtonText}>Restart Adventure</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 16, marginBottom: 20, textAlign: "center" },
  restartButton: { backgroundColor: "green", padding: 15, borderRadius: 10, marginTop: 20 },
  restartButtonText: { color: "white", fontSize: 16, fontWeight: "bold", textAlign: "center" },
});

export default Scene09;
