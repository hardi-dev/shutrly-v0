import type { Ref } from "react";

// The part of a React Hook Form field the password input needs, so the create and the rotate
// dialogs (two different schemas) share one component.
export interface PasswordFieldBinding {
  readonly name: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onBlur: () => void;
  readonly ref: Ref<HTMLInputElement>;
}

export interface PasswordProposalFieldProps {
  readonly label: string;
  readonly description: string;
  readonly field: PasswordFieldBinding;
  /** The field-error message, already translated; it replaces the description. */
  readonly errorMessage: string | undefined;
  readonly isRegenerating: boolean;
  readonly onRegenerate: () => void;
}
