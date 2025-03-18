import { forwardRef } from "react";
import { Switch, type SwitchProps } from "react-native";

import Colors from "@/constants/Colors";

const Toggle = forwardRef<Switch, SwitchProps>(({ ...props }, ref) => {
  return (
    <Switch ref={ref} {...props} trackColor={{ true: Colors.light.tint }} />
  );
});

export default Toggle;
