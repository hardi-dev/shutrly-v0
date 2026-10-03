export interface TimeFieldProps {
  readonly label: string;
  /** The time as HH:MM (24-hour), or null while empty. */
  readonly value: string | null;
  readonly onChange: (value: string | null) => void;
  readonly isOptional?: boolean;
  readonly errorMessage?: string;
  readonly isDisabled?: boolean;
}
