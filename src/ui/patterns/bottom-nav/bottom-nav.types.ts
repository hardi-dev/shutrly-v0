import type { IconName } from "@/ui/primitives/icon/icon.types";

export interface BottomNavData {
  href: string;
  label: string;
  icon: IconName;
  count?: number;
  isActive?: boolean;
}

export interface BottomNavProps {
  items: readonly [BottomNavData, BottomNavData, BottomNavData, BottomNavData];
  ctaLabel: string;
  onCtaPress: () => void;
  className?: string;
}
