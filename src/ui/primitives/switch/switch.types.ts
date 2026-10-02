export interface SwitchProps {
  readonly label: string;
  readonly isSelected: boolean;
  readonly onChange: (isSelected: boolean) => void;
  readonly isDisabled?: boolean;
  readonly description?: string;
  readonly className?: string;
}
