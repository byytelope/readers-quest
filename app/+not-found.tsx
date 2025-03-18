import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import TextButton from "@/components/TextButton";
import { Text, View } from "@/components/Themed";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <SafeAreaView className="flex-1 items-center p-4 bg-white dark:bg-black">
        <View className="flex-1 items-center justify-center">
          <Text className="text-7xl p-4">😓</Text>
          <Text className="text-3xl font-bold">Uh oh!</Text>
          <Text className="text-xl">Something went wrong...</Text>
        </View>
        <View className="w-full">
          <TextButton
            text="Go back"
            onPress={() => {
              if (router.canDismiss()) {
                router.dismissTo("/");
              } else {
                router.dismissAll();
                router.replace("/");
              }
            }}
          />
        </View>
      </SafeAreaView>
    </>
  );
}
