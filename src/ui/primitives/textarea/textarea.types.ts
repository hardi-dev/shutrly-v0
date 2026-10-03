import type { Ref } from "react";

import type { FieldNameProps } from "../text-field/text-field.types";

export type TextareaProps = FieldNameProps & {
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
  rows?: number;
  trailingMeta?: string;
};

export interface TextareaDescriptionProps {
  errorMessage?: string;
  helperText?: string;
  errorMessageId: string;
}

export interface TextareaFooterProps extends TextareaDescriptionProps {
  trailingMeta?: string;
}
