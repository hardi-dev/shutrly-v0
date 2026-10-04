import type { GallerySummaryView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

export type ExpiryFacts = Pick<GallerySummaryView, "status" | "expiresAt" | "expiryDays">;
export type MetaFacts = ExpiryFacts & Pick<GallerySummaryView, "activeSourceCount" | "counts">;

export interface ExpiryFact {
  readonly text: string;
  readonly isMuted: boolean;
}
