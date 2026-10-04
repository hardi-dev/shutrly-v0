export interface RadioOption {
  readonly value: string;
  readonly label: string;
}

export interface RadioGroupProps {
  readonly label: string;
  readonly options: readonly RadioOption[];
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly isDisabled?: boolean;
}

export interface RadioDotProps {
  readonly isSelected: boolean;
  readonly isFocusVisible: boolean;
}

export interface RadioRowProps {
  readonly option: RadioOption;
}
