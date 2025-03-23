import { useHeaderHeight } from "@react-navigation/elements";
import { usePreventRemove } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import CheckBox from "@/components/Checkbox";
import TextButton from "@/components/TextButton";
import TextField from "@/components/TextField";
import { Text } from "@/components/Themed";
import { useSupabase } from "@/utils/supabaseContext";

export default function TestScreen() {
  const { updateUser } = useSupabase();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const [nameText, setNameText] = useState("");
  const [ageText, setAgeText] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [disabilityCheck, setDisabilityCheck] = useState(false);

  const handleSubmit = async () => {
    const error = await updateUser(
      {
        age: Number.parseInt(ageText),
        name: nameText,
        has_disabilities: disabilityCheck,
      },
      userId,
    );

    if (!error) {
      Alert.alert(
        "Almost there!",
        "Please check your email to confirm your account before signing in.",
      );
      router.replace("/(protected)/home");
    } else {
      setErrorText(error.message);
      Alert.alert(error.message);
    }
  };

  usePreventRemove(errorText != null, () => {
    Alert.alert("Please fill out this information");
  });

  return (
    <SafeAreaView
      className="flex-1 justify-start gap-8 p-4 bg-white dark:bg-black"
      edges={["bottom"]}
    >
      <StatusBar style="light" animated />
      <KeyboardAvoidingView
        className="flex-1 gap-6 justify-between"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight + insets.bottom}
      >
        <ScrollView
          className="flex-1"
          contentInsetAdjustmentBehavior="automatic"
        >
          <View className="gap-4 pt-8">
            <TextField
              label="Name"
              keyboardType="name-phone-pad"
              autoComplete="off"
              autoCorrect={false}
              onChangeText={setNameText}
            />
            <TextField
              label="Age"
              keyboardType="number-pad"
              autoComplete="off"
              autoCorrect={false}
              onChangeText={setAgeText}
            />
            <Pressable
              className="flex-row gap-4 items-center bg-stone-100 dark:bg-stone-900 rounded-lg p-4"
              onPress={() => setDisabilityCheck((prev) => !prev)}
            >
              <CheckBox
                value={disabilityCheck}
                onValueChange={setDisabilityCheck}
              />
              <Text className="flex-shrink text-stone-600 text-sm font-medium uppercase">
                Does the child have any disabilities (learning, physical, mental
                etc...)?
              </Text>
            </Pressable>
          </View>
        </ScrollView>
        <TextButton text="Continue" onPress={handleSubmit} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
