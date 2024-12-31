import { Pressable, Text } from "react-native";

interface ButtonProps
  extends Omit<React.ComponentProps<typeof Pressable>, "children"> {
  text: string;
  secondary?: boolean;
  recording?: boolean;
}

export default function TextButton({
  text,
  secondary = false,
  recording = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={`w-full justify-center items-center px-6 h-16 rounded-full ${props.disabled ? "bg-stone-300 dark:bg-stone-600" : recording ? "bg-red-500" : "bg-lime-600 active:bg-lime-700"} ${className}`}
      {...props}
    >
      <Text
        className={`${props.disabled ? "text-stone-400 dark:text-stone-400" : "text-white"} text-xl font-bold`}
      >
        {text}
      </Text>
    </Pressable>
  );
}
