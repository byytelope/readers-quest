import { useHeaderHeight } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import TextButton from "@/components/TextButton";
import TextField from "@/components/TextField";
import { isStrongPassword, isValidEmail } from "@/utils/helpers";
import { useSupabase } from "@/utils/supabaseContext";

export default function SignInScreen() {
  const { signIn } = useSupabase();
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const [emailText, setEmailText] = useState("");
  const [passwordText, setPasswordText] = useState("");

  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();

  const handleSubmit = async () => {
    let hasError = false;

    if (!isValidEmail(emailText)) {
      setEmailError("Invalid email");
      hasError = true;
    } else {
      setEmailError(undefined);
    }

    if (!isStrongPassword(passwordText)) {
      setPasswordError("Password not strong enough");
      hasError = true;
    } else {
      setPasswordError(undefined);
    }

    if (!hasError) {
      const error = await signIn(emailText, passwordText);

      if (error) {
        Alert.alert(error.message);
      } else {
        router.dismissAll();
        router.replace("/(protected)/home");
      }
    }
  };

  return (
    <SafeAreaView
      className="flex-1 justify-start gap-8 p-4 bg-white dark:bg-black"
      edges={["bottom"]}
    >
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
          <View className="gap-4 pt-8">
            <TextField
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              autoCorrect={false}
              onChangeText={setEmailText}
              error={emailError}
            />
            <TextField
              label="Password"
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect={false}
              secureTextEntry
              onChangeText={setPasswordText}
              error={passwordError}
            />
          </View>
        </ScrollView>
        <TextButton text="Continue" onPress={handleSubmit} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
