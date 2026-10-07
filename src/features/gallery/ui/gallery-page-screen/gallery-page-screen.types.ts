import type { ReactNode } from "react";

import type { GalleryPageScreenView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";

export interface GalleryPageScreenProps {
  readonly workspaceId: string;
  readonly page: GalleryPageScreenView;
  readonly actions: GalleryPageActions;
  /** A folder linked in *Buat galeri* (`?sync=`), synced once when the page opens (Revision OT #3). */
  readonly initialSyncSourceId?: string;
  /** F-10 *Akses klien*: link, password, expiry, *Ganti link* and *Ganti password* (client-access D-20). */
  readonly accessCard?: ReactNode;
  /** F-10 *Pilihan klien*, after *Akses klien* (D-20). */
  readonly selectionCard?: ReactNode;
  /** F-10 *Hasil akhir*, after *Pilihan klien* and before *Sumber foto* (D-20). */
  readonly deliveryCard?: ReactNode;
}
