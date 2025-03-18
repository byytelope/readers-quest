import { forwardRef } from "react";
import { Text, TextInput, type TextInputProps, View } from "react-native";

import Colors from "@/constants/Colors";

type TextFieldProps = Omit<TextInputProps, "className" | "style"> & {
  label?: string;
  error?: string;
};

const TextField = forwardRef<TextInput, TextFieldProps>(({ ...props }, ref) => {
  return (
    <View className="flex-col gap-1">
      {props.label != null ? (
        <Text
          className={`${props.error ? "text-red-500" : "text-stone-500"} font-semibold pl-3`}
        >
          {props.label}
        </Text>
      ) : (
        <></>
      )}
      <TextInput
        ref={ref}
        {...props}
        selectionColor={Colors.light.tint}
        className={`min-w-full h-14 px-3 rounded-lg ${props.error ? "bg-red-100 dark:bg-red-900" : "bg-stone-100 dark:bg-stone-900"} text-black dark:text-white`}
      />
      <Text className="text-sm text-red-500 pl-3">{props.error}</Text>
    </View>
  );
});

export default TextField;
