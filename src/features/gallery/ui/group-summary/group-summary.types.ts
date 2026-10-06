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
  /** Usage reached the limit: the bar shows the warning tone (pilih-batas-tercapai). */
  readonly isFull?: boolean;
  /** Tinjau: an `OPEN` group shows *· sisa n* instead of *dipilih* (tinjau exports). */
  readonly remaining?: number;
  readonly action?: ReactNode;
  readonly className?: string;
}
