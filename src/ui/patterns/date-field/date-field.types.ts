export type DateFieldDisplay = "date" | "weekday";

export interface DateFieldProps {
  readonly label: string;
  /** The date as YYYY-MM-DD, or null while empty. */
  readonly value: string | null;
  readonly onChange: (value: string | null) => void;
  /** *10 Nov 2026* (`date`) or *Sel, 10 Nov 2026* (`weekday`). */
  readonly display: DateFieldDisplay;
  readonly placeholder?: string;
  readonly isOptional?: boolean;
  readonly errorMessage?: string;
  readonly isDisabled?: boolean;
}
