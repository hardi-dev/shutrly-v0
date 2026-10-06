import type { ReactNode } from "react";

import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";

export interface ClientPhotoViewerProps {
  readonly photos: readonly ClientPhotoView[];
  /** The open photo, or null when closed. */
  readonly index: number | null;
  readonly onIndexChange: (index: number) => void;
  readonly onClose: () => void;
  /** Pick controls for the open photo (Slice 4); none in the read-only viewer. */
  readonly renderActions?: (photo: ClientPhotoView) => ReactNode;
  /** The phone pick bar under the photo (pratinjau-pilih-untuk CV94I). */
  readonly renderFooter?: (photo: ClientPhotoView) => ReactNode;
  /** Replaces the folder line, e.g. *Dipilih di: Foto cetak × 1* (A-30). */
  readonly metaOf?: (photo: ClientPhotoView) => string | null;
}
