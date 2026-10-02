import type { ReactNode } from "react";

import type { IconName } from "@/ui/primitives/icon/icon.types";

export interface ListCardItemProps {
  icon: IconName;
  title: string;
  meta: string;
  /** Status Chip and/or a row-actions button. Not allowed together with href (list-card.md). */
  trailing?: ReactNode;
  href?: string;
  isLast?: boolean;
}

export interface ListCardItemSkeletonProps {
  isLast?: boolean;
  hasTrailing?: boolean;
}
