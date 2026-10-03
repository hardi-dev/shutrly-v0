import type { IconName } from "@/ui/primitives/icon/icon.types";
import type { FieldNameProps } from "@/ui/primitives/text-field/text-field.types";

export interface SelectOption {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly icon?: IconName;
  readonly isDisabled?: boolean;
  /** Options with the same section render under one group label (services by category). */
  readonly section?: string;
}

export interface SelectOptionGroup {
  readonly section: string | null;
  readonly options: readonly SelectOption[];
}

export type SelectProps = FieldNameProps & {
  readonly options: readonly SelectOption[];
  readonly value: string | null;
  readonly onChange: (id: string) => void;
  readonly placeholder?: string;
  readonly description?: string;
  readonly errorMessage?: string;
  readonly isDisabled?: boolean;
  readonly isOptional?: boolean;
  readonly pickerDescription?: string;
  readonly name?: string;
};

export interface SelectOptionItemProps {
  readonly option: SelectOption;
  readonly isSelected: boolean;
}

export interface MobileSelectTriggerProps {
  readonly label: string;
  readonly placeholder?: string;
  readonly selectedOption?: SelectOption;
  readonly isDisabled?: boolean;
  readonly onPress: () => void;
}

export interface MobileSelectSheetProps {
  readonly label: string;
  readonly pickerDescription?: string;
  readonly options: readonly SelectOption[];
  readonly pendingValue: string | null;
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly onPendingChange: (keys: Set<string | number> | "all") => void;
  readonly onPick: () => void;
}

export interface SelectMessageProps {
  readonly description?: string;
  readonly errorMessage?: string;
  readonly errorMessageId: string;
}
