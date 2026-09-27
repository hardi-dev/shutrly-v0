import type { IconName } from "@/ui/primitives/icon/icon.types";

export interface NavItemProps {
  href: string;
  label: string;
  icon: IconName;
  count?: number;
  isActive?: boolean;
  className?: string;
}
