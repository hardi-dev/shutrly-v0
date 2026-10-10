import type { ReactNode } from "react";

export interface GalleryFact {
  readonly label: string;
  readonly value: ReactNode;
  /** Muted value, e.g. *Tidak ada*. */
  readonly isMuted?: boolean;
}

export interface GalleryFactsProps {
  readonly facts: readonly GalleryFact[];
  /** No padding, when the facts share a padded body with other content (Galeri card, Owner 7). */
  readonly isFlush?: boolean;
}
