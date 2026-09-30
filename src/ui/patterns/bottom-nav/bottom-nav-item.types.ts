import type { IconName } from "@/ui/primitives/icon/icon.types";

export interface BottomNavItemProps {
  href: string;
  label: string;
  icon: IconName;
  count?: number;
  isActive?: boolean;
  onPress?: () => void;
  className?: string;
}
