import LottieView from "lottie-react-native";

import { getAward } from "@/utils/helpers";
import TextButton from "./TextButton";
import { Text, View } from "./Themed";
import { forwardRef } from "react";

type ConfettiViewProps = {
  getGrade: (length: number) => number;
  content: string[];
  scores: number[];
  handleFinish: () => Promise<void>;
};

const ConfettiView = forwardRef<LottieView, ConfettiViewProps>(
  ({ content, getGrade, handleFinish, scores }, ref) => {
    return (
      <>
        <View className="gap-4 items-center justify-center flex-1">
          <LottieView
            ref={ref}
            source={require("@/assets/lottie/confetti.json")}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              backgroundColor: "transparent",
              display: getGrade(content.length) >= 0.5 ? "flex" : "none",
            }}
            autoPlay={false}
          />
          <Text className="text-6xl pt-2">
            {getAward(getGrade(content.length)).emoji}
          </Text>
          <Text className="text-4xl font-bold text-center w-full">
            {getAward(getGrade(content.length)).message}
          </Text>
          <Text className="text-2xl text-center">
            Your total score is {scores.reduce((i, j) => i + j, 0)} points.
          </Text>
        </View>
        <TextButton text="Finish" onPress={handleFinish} />
      </>
    );
  },
);

export default ConfettiView;
