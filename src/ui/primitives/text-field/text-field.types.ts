import type { Ref } from "react";
export interface TextFieldProps {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  description?: string;
  errorMessage?: string;
  isReadOnly?: boolean;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef?: Ref<HTMLInputElement>;
}
