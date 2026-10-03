export interface CheckboxProps {
  readonly label: string;
  readonly isSelected: boolean;
  readonly onChange: (isSelected: boolean) => void;
  readonly isDisabled?: boolean;
}
