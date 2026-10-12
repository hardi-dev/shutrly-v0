/** What a field holds: a money amount (IDR grouping) or a decimal quantity. */
export type ReformatKind = "amount" | "quantity";

export interface LocaleReformatOptions {
  /** The field's current text. */
  readonly value: string;
  /** Writes the reformatted text back to the field. */
  readonly setValue: (next: string) => void;
  /** The kind of value, or `null` for a text field that never reformats. */
  readonly kind: ReformatKind | null;
}
