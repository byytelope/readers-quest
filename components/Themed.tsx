import {
  Text as DefaultText,
  View as DefaultView,
  useColorScheme,
} from "react-native";

import Colors from "@/constants/Colors";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[theme][colorName];
}

export function Text({ className, ...props }: DefaultText["props"]) {
  return (
    <DefaultText
      {...props}
      className={`text-black dark:text-white ${className}`}
    />
  );
}

export function View({ className, ...props }: DefaultView["props"]) {
  return (
    <DefaultView {...props} className={`bg-white dark:bg-black ${className}`} />
  );
}
