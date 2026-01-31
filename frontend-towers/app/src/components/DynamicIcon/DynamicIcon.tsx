import * as icons from "@mui/icons-material";
import { JSX } from "react";

import IconCircle from "@mui/icons-material/Circle";

export type IconNames = keyof typeof icons; // use this in other components

interface IGenericIconProps {
  iconName: IconNames;
}

export const DynamicIcon = ({ iconName }: IGenericIconProps): JSX.Element => {
  if (iconName in icons) {
    const Icon = icons[iconName];
    return <Icon />;
  }
  return <IconCircle />;
};
