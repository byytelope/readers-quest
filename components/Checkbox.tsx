import { Checkbox, type CheckboxProps } from "expo-checkbox";

import Colors from "@/constants/Colors";

const CheckBox = (props: CheckboxProps) => {
  return <Checkbox {...props} color={Colors.light.tint} />;
};

export default CheckBox;
