import type { IconName } from "@/ui/primitives/icon/icon.types";

export interface NavRailItemProps {
  href: string;
  label: string;
  icon: IconName;
  isActive?: boolean;
  className?: string;
}
