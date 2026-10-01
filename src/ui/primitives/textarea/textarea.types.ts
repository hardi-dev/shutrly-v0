import type { Ref } from "react";

export interface TextareaProps {
  label: string;
  name?: string;
  optional?: boolean;
  helperText?: string;
  errorMessage?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  className?: string;
  textareaRef?: Ref<HTMLTextAreaElement>;
  isLabelHidden?: boolean;
  rows?: number;
  trailingMeta?: string;
}
