import type { ReactNode } from "react";

import type { GallerySourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

export interface SourcesCardProps {
  readonly sources: readonly GallerySourceView[];
  /** Header actions (*Sinkronkan semua*, *Tambah folder*) while sources can change. */
  readonly actions?: ReactNode;
  /** The empty state's *Tambah folder*. */
  readonly emptyAction?: ReactNode;
  readonly children?: ReactNode;
}
