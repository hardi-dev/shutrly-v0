import type { Ref } from "react";

export type InputVariant = "default" | "search";
export type InputIconName = "search" | "chevron-down" | "calendar" | "eye" | "circle-alert";

export interface InputIconProps {
  name: InputIconName;
  side: "leading" | "trailing";
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
  iconTrailing?: InputIconName;
  shortcut?: string;
  className?: string;
  "aria-label"?: string;
  inputRef?: Ref<HTMLInputElement>;
}
