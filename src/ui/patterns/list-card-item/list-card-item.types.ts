import type { ReactNode } from "react";

import type { IconName } from "@/ui/primitives/icon/icon.types";

export interface ListCardItemProps {
  icon?: IconName;
  avatarInitials?: string;
  title: string;
  meta: string;
  /** `danger` colours the meta for a failure reason (F-09 source rows). */
  metaTone?: "default" | "danger";
  /** Status Chip and/or a row-actions button. When href is set, actions render beside the link. */
  trailing?: ReactNode;
  href?: string;
  isLast?: boolean;
}

export interface ListCardItemSkeletonProps {
  isLast?: boolean;
  hasTrailing?: boolean;
}
