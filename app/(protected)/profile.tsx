import { useHeaderHeight } from "@react-navigation/elements";
import { usePreventRemove } from "@react-navigation/native";
import { useEffect, useState } from "react";
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
import { Text } from "@/components/Themed";
import { useSupabase } from "@/utils/supabaseContext";

export default function ProfileScreen() {
  const { user, updateUser, signOut } = useSupabase();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const [nameText, setNameText] = useState("");
  const [ageText, setAgeText] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load current user data
  useEffect(() => {
    if (user) {
      setNameText(user.name || "");
      setAgeText(user.age ? String(user.age) : "");
    }
  }, [user]);

  // Track changes
  useEffect(() => {
    if (user) {
      const nameChanged = nameText !== user.name && nameText !== "";
      const ageChanged = ageText !== String(user.age) && ageText !== "";
      setHasChanges(nameChanged || ageChanged);
    }
  }, [nameText, ageText, user]);

  const handleSubmit = async () => {
    const updates: {
      name?: string;
      age?: number;
    } = {};

    if (nameText && nameText !== user?.name) {
      updates.name = nameText;
    }

    if (ageText && Number.parseInt(ageText) !== user?.age) {
      updates.age = Number.parseInt(ageText);
    }

    const error = await updateUser(updates);

    if (!error) {
      setErrorText(null);
      setHasChanges(false);
      Alert.alert("Success", "Your profile has been updated.");
    } else {
      setErrorText(error.message);
    }
  };

  usePreventRemove(hasChanges, () => {
    Alert.alert(
      "Unsaved Changes",
      "You have unsaved changes. Are you sure you want to leave?",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "Discard Changes",
          style: "destructive",
          onPress: () => {
            // Reset form and allow navigation
            setNameText(user?.name || "");
            setAgeText(user?.age ? String(user.age) : "");
            setHasChanges(false);
          },
        },
      ],
    );
  });

  return (
    <SafeAreaView
      className="flex-1 justify-start gap-8 p-4 bg-white dark:bg-black"
      edges={["bottom"]}
    >
      <KeyboardAvoidingView
        className="flex-1 gap-6 justify-between"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight + insets.bottom}
      >
        <ScrollView
          className="flex-1"
          contentInsetAdjustmentBehavior="automatic"
        >
          <Text className="text-xl font-bold mb-4">Edit Your Profile</Text>
          <View className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4 mb-6">
            <Text className="text-sm text-stone-500 dark:text-stone-400">
              Your Reading Points
            </Text>
            <Text className="text-2xl font-bold">
              {user?.score.toLocaleString() || 0} pts
            </Text>
          </View>
          <TextField
            label="Name"
            keyboardType="name-phone-pad"
            autoComplete="off"
            autoCorrect={false}
            onChangeText={setNameText}
            value={nameText}
            placeholder={user?.name || "Your name"}
          />
          <TextField
            label="Age"
            keyboardType="number-pad"
            autoComplete="off"
            autoCorrect={false}
            onChangeText={setAgeText}
            value={ageText}
            placeholder={user?.age ? String(user.age) : "Your age"}
          />
          {errorText && <Text className="text-red-500 mt-2">{errorText}</Text>}
        </ScrollView>
        <View className="gap-4 w-full px-0 sm:px-24 lg:px-64">
          <TextButton
            text="Sign Out"
            onPress={async () => {
              await signOut();
            }}
          />
          <TextButton
            text="Update Profile"
            onPress={handleSubmit}
            disabled={!hasChanges}
            style={!hasChanges ? { opacity: 0.5 } : {}}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
