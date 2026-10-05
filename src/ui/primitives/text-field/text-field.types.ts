import type { Ref } from "react";

import type { InputIconAction, InputIconName } from "../input/input.types";

/** A field is named by its visible label or, when no label is drawn, by an aria-label. */
export type FieldNameProps =
  | { readonly label: string; readonly "aria-label"?: string }
  | { readonly label?: never; readonly "aria-label": string };

export type TextFieldProps = FieldNameProps & {
  readonly name: string;
  readonly type?: string;
  readonly autoComplete?: string;
  readonly placeholder?: string;
  readonly description?: string;
  readonly errorMessage?: string;
  readonly isOptional?: boolean;
  readonly isReadOnly?: boolean;
  readonly isDisabled?: boolean;
  readonly prefix?: string;
  readonly iconLeading?: InputIconName;
  readonly iconLeadingAction?: InputIconAction;
  readonly iconTrailing?: InputIconName;
  readonly iconTrailingAction?: InputIconAction;
  /** Keeps the trailing icon and its action when the field is invalid, for an action that fixes the error (for example *Buat ulang*); otherwise the error icon replaces them. */
  readonly keepTrailingOnError?: boolean;
  readonly shortcut?: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onBlur: () => void;
  readonly inputRef?: Ref<HTMLInputElement>;
};

export type TextFieldContentProps = TextFieldProps & {
  readonly isInvalid: boolean;
  readonly errorMessageId: string;
};
