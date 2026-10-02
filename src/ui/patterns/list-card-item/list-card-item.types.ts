import type { ReactNode } from "react";

import type { IconName } from "@/ui/primitives/icon/icon.types";

export interface ListCardItemProps {
  icon: IconName;
  title: string;
  meta: string;
  /** Status Chip and/or a row-actions button. When href is set, actions render beside the link. */
  trailing?: ReactNode;
  href?: string;
  isLast?: boolean;
}

export interface ListCardItemSkeletonProps {
  isLast?: boolean;
  hasTrailing?: boolean;
}
