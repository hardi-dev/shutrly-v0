import type { Ref } from "react";

import type { IconName } from "../icon/icon.types";

export type InputVariant = "default" | "search";
export type InputIconName = Extract<
  IconName,
  | "search"
  | "x"
  | "chevron-down"
  | "chevrons-up-down"
  | "calendar"
  | "clock"
  | "eye"
  | "eye-off"
  | "circle-alert"
>;

export interface InputIconAction {
  label: string;
  onPress: () => void;
}

export interface InputIconProps {
  name: InputIconName;
  side: "leading" | "trailing";
}

export interface InputAdornmentIconProps extends InputIconProps {
  action?: InputIconAction;
  isDisabled?: boolean;
}

export interface InputFrameProps extends InputProps {
  resolvedType: string;
}

export interface InputProps {
  variant?: InputVariant;
  name?: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  prefix?: string;
  iconLeading?: InputIconName;
  iconLeadingAction?: InputIconAction;
  iconTrailing?: InputIconName;
  iconTrailingAction?: InputIconAction;
  shortcut?: string;
  className?: string;
  "aria-label"?: string;
  inputRef?: Ref<HTMLInputElement>;
}
