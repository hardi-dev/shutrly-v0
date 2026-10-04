import type { ReactNode } from "react";

export interface GalleryFact {
  readonly label: string;
  readonly value: ReactNode;
  /** Muted value, e.g. *Tidak ada*. */
  readonly isMuted?: boolean;
}

export interface GalleryFactsProps {
  readonly facts: readonly GalleryFact[];
}
