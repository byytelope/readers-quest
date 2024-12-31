import { Pressable } from "react-native";

interface SelectButtonProps extends React.ComponentProps<typeof Pressable> {
  active: boolean;
}

const SelectButton = ({ className, active, ...props }: SelectButtonProps) => {
  return (
    <Pressable
      {...props}
      className={`p-4 w-24 h-24 md:w-36 md:h-36 justify-center items-center border-2 rounded-xl bg-stone-100 dark:bg-stone-900 ${active ? "border-lime-600 bg-lime-200 dark:bg-lime-900" : "border-stone-300 dark:border-stone-800"} ${className}`}
    />
  );
};

export default SelectButton;
