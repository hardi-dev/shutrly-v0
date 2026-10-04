import type { ReactNode } from "react";

import type { GallerySummaryView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

export interface AccessCardProps {
  readonly gallery: GallerySummaryView;
  /** *Ganti password*, absent when the gallery is read-only. */
  readonly action?: ReactNode;
}
