import {
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheet,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { forwardRef, useState } from "react";
import {
  Text as DefaultText,
  Pressable,
  Alert,
  useColorScheme,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SelectButton from "@/components/SelectButton";
import TextButton from "@/components/TextButton";
import { View, Text } from "@/components/Themed";
import Colors from "@/constants/Colors";

const EmotionalCheckInModal = forwardRef<BottomSheetModal>((_, ref) => {
  const [selectedEmotion, setSelectedEmotion] = useState("happy");
  const colorScheme = useColorScheme();
  const { bottom } = useSafeAreaInsets();
  const bottomSheetModal = useBottomSheetModal();

  const emotions = [
    { label: "😄", value: "happy" },
    { label: "🙂", value: "okay" },
    { label: "☹", value: "sad" },
  ];

  const handleSubmit = () => {
    if (selectedEmotion === "sad") {
      Alert.alert(
        "Take a break",
        "It's okay to take a short break. Come back stronger!",
      );
    }

    bottomSheetModal.dismiss();
  };

  return (
    <BottomSheetModal
      ref={ref}
      backgroundStyle={
        colorScheme === "dark"
          ? { backgroundColor: Colors.dark.background }
          : { backgroundColor: Colors.light.background }
      }
      backdropComponent={CustomBackdrop}
      handleIndicatorStyle={
        colorScheme === "dark"
          ? { backgroundColor: "rgba(255,255,255,0.5)" }
          : { backgroundColor: "rgba(0,0,0,0.5)" }
      }
    >
      <BottomSheetView
        style={{ paddingBottom: bottom }}
        className="p-4 items-center gap-8"
      >
        <View className="items-center">
          <Text className="text-2xl font-bold">Emotional Check-In</Text>
          <Text className="text-lg font-medium">
            How do you feel about the exercise?
          </Text>
        </View>
        <View className="flex-row justify-center w-full gap-8">
          {emotions.map((emotion) => (
            <SelectButton
              key={emotion.value}
              active={selectedEmotion === emotion.value}
              onPress={() => setSelectedEmotion(emotion.value)}
            >
              <Text className="text-4xl">{emotion.label}</Text>
            </SelectButton>
          ))}
        </View>
        <DefaultText className="text-stone-500 dark:text-stone-400">
          Select the icon that best matches your current feeling.
        </DefaultText>
        <TextButton text="Submit" onPress={handleSubmit} />
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default EmotionalCheckInModal;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const CustomBackdrop = ({ style }: BottomSheetBackdropProps) => {
  const { close } = useBottomSheet();
  const colorScheme = useColorScheme();

  return (
    <AnimatedPressable
      onPress={() => close()}
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(300)}
      style={[
        style,
        colorScheme === "dark"
          ? { backgroundColor: "rgba(255, 255, 255, 0.1)" }
          : { backgroundColor: "rgba(0, 0, 0, 0.4)" },
      ]}
    />
  );
};
