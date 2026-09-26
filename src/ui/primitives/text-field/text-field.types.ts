import type { Ref } from "react";

import type { InputIconAction, InputIconName } from "../input/input.types";

export interface TextFieldProps {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  description?: string;
  errorMessage?: string;
  isOptional?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  prefix?: string;
  iconLeading?: InputIconName;
  iconLeadingAction?: InputIconAction;
  iconTrailing?: InputIconName;
  iconTrailingAction?: InputIconAction;
  shortcut?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef?: Ref<HTMLInputElement>;
}

export interface TextFieldContentProps extends TextFieldProps {
  isInvalid: boolean;
}
