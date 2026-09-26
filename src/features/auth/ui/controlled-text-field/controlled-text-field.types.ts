import type { Control, FieldValues, Path } from "react-hook-form";

export interface ControlledTextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  placeholder?: string;
}
