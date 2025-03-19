import { useHeaderHeight } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import TextButton from "@/components/TextButton";
import TextField from "@/components/TextField";
import { Text } from "@/components/Themed";
import { useSupabase } from "@/utils/supabaseContext";

export default function PeerConnectionScreen() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { user } = useSupabase();

  const [sessionCode, setSessionCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const generateSessionCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSessionCode(code);
    setIsCreating(true);
  };

  const handleJoinSession = async () => {
    if (sessionCode.length !== 6) {
      setErrorText("Session code must be 6 digits");
      return;
    }

    router.push({
      pathname: "/(protected)/peer-reading/reading-screen",
      params: {
        sessionCode: sessionCode,
        isHost: +isCreating,
        userId: user?.id || "",
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 justify-start gap-8 p-4 bg-white dark:bg-black">
      <StatusBar style="light" animated />
      <KeyboardAvoidingView
        className="flex-1 gap-6"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight + insets.bottom}
      >
        <ScrollView
          className="flex-1"
          contentInsetAdjustmentBehavior="automatic"
        >
          <View className="gap-6">
            <Text className="pr-1">
              {isCreating
                ? "Share this code with your peer to begin reading together"
                : "Enter a 6-digit session code to join a peer's reading session"}
            </Text>
            <TextField
              label="Session Code"
              keyboardType="number-pad"
              autoComplete="off"
              autoCorrect={false}
              onChangeText={setSessionCode}
              value={sessionCode}
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
            {errorText && (
              <Text className="text-red-500 mt-2">{errorText}</Text>
            )}
          </View>
        </ScrollView>
        <View className="gap-4">
          <TextButton
            text={isCreating ? "Start Session" : "Join Session"}
            onPress={handleJoinSession}
          />
          {!isCreating && (
            <TextButton
              text="Create New Session"
              onPress={generateSessionCode}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
