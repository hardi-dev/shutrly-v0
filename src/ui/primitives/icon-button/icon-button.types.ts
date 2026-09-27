import type { IconName } from "../icon/icon.types";

export type IconButtonSize = "sm" | "md";

export interface IconButtonProps {
  icon: IconName;
  size?: IconButtonSize;
  "aria-label": string;
  onPress?: () => void;
  isDisabled?: boolean;
  className?: string;
}
