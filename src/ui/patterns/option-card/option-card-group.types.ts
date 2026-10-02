import type { IconName } from "@/ui/primitives/icon/icon.types";

export interface OptionCardOption {
  value: string;
  title: string;
  description?: string;
  icon: IconName;
  isDisabled?: boolean;
  badge?: string;
}

export interface OptionCardGroupProps {
  label: string;
  options: readonly OptionCardOption[];
  value: string;
  onChange: (value: string) => void;
  isLabelVisible?: boolean;
}

export interface OptionCardProps {
  option: OptionCardOption;
}
