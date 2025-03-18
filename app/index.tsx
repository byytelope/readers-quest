import { Image } from "expo-image";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { Text as DefaultText, View as DefaultView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TextButton from "@/components/TextButton";
import { Text, View } from "@/components/Themed";
import { useSupabase } from "@/utils/supabaseContext";

export default function WelcomeScreen() {
  const router = useRouter();
  const segments = useSegments();
  const { session, signIn } = useSupabase();

  useEffect(() => {
    if (session && segments[0] == null) {
      router.replace("/(protected)/home");
    }
  }, [session, router.replace, segments]);

  return (
    <SafeAreaView className="flex-1 justify-between items-center p-4 bg-white dark:bg-black">
      <DefaultView className="flex-1 justify-center items-center gap-4 p-8 w-full">
        <Image
          source={require("@/assets/images/appicon.png")}
          style={{ width: 100, height: 100 }}
        />
        <DefaultText className="text-4xl font-black text-lime-700 dark:text-lime-500 text-center">
          Reader's Quest
        </DefaultText>
        <Text className="text-xl font-medium text-center pb-2">
          Welcome traveller! Are you ready to begin your quest?
        </Text>
      </DefaultView>
      <View className="w-full gap-4 px-0 sm:px-24 lg:px-64">
        <TextButton
          text="Login"
          onPress={async () => {
            const error = await signIn("shadhanm@gmail.com", "Password@123");

            if (error) {
              console.log(error.message);
            }
          }}
        />
        <TextButton text="Sign In" onPress={() => router.push("/sign-in")} />
        <TextButton text="Sign Up" onPress={() => router.push("/sign-up")} />
      </View>
    </SafeAreaView>
  );
}
