import type { ReactNode } from "react";

import type { SelectionGroupStatus } from "@/features/gallery/domain/selection-usage/selection-usage.types";

export interface GroupSummaryProps {
  readonly name: string;
  readonly status: SelectionGroupStatus;
  readonly limit: number;
  readonly usage: number;
  readonly unit: string | null;
  /** 0…1 */
  readonly progress: number;
  readonly action?: ReactNode;
  readonly className?: string;
}
