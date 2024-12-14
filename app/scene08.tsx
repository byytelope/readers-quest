import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

const Scene08 = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scene 8: Summary</Text>
      <Text style={styles.subtitle}>Here’s what you’ve shared so far:</Text>

      <Text style={styles.summaryText}>- Quiz Answer: Perseverance</Text>
      <Text style={styles.summaryText}>- Reflection: Teamwork is the key to success.</Text>

      <TouchableOpacity style={styles.nextButton} onPress={() => router.push("/scene09")}>
        <Text style={styles.nextButtonText}>Proceed to Final Screen</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  summaryText: { fontSize: 14, marginVertical: 5 },
  nextButton: { backgroundColor: "blue", padding: 15, borderRadius: 10, marginTop: 20 },
  nextButtonText: { color: "white", fontSize: 16, fontWeight: "bold", textAlign: "center" },
});

export default Scene08;
