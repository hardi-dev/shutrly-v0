import type { GallerySourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type { GalleryMenuEntry } from "../gallery-row-menu/gallery-row-menu.types";
import type { SourceSyncPhase } from "../source-text/source-text.types";

export interface GallerySourceRowProps {
  readonly source: GallerySourceView;
  readonly phase: SourceSyncPhase;
  readonly isArchived: boolean;
  readonly isReadOnly: boolean;
  /** Empty when the source can't change (removed, archived, cancelled project). */
  readonly menuEntries: readonly GalleryMenuEntry[];
  readonly isLast: boolean;
}
