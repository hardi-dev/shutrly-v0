export interface MultiSelectOption {
  readonly id: string;
  readonly label: string;
}

export interface MultiSelectProps {
  readonly label: string;
  readonly placeholder: string;
  readonly options: readonly MultiSelectOption[];
  readonly selectedIds: readonly string[];
  readonly onChange: (ids: string[]) => void;
  readonly isDisabled?: boolean;
}
