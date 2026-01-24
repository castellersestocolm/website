import * as icons from "@mui/icons-material";
import { JSX } from "react";

export type IconNames = keyof typeof icons; // use this in other components

interface IGenericIconProps {
  iconName: IconNames;
}

export const DynamicIcon = ({ iconName }: IGenericIconProps): JSX.Element => {
  const Icon = icons[iconName];
  return <Icon />;
};
