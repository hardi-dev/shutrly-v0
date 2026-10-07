import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";
import type { ProofDownloadView } from "@/features/gallery/application/use-cases/list-proof-downloads/list-proof-downloads.types";
import type { SetPicksResult } from "@/features/gallery/application/use-cases/set-picks/set-picks.types";

import type {
  DownloadItem,
  SequentialDownload,
} from "../use-sequential-download/use-sequential-download.types";

type SignedOut = { readonly kind: "SIGNED_OUT" };

/** The *Semua foto* download and bulk-pick actions, bound to the token by the page (F-19). */
export interface PhotosActions {
  readonly listDownloads: () => Promise<readonly ProofDownloadView[] | SignedOut>;
  readonly setPicks: (input: {
    readonly groupId: string;
    readonly photoIds: readonly string[];
  }) => Promise<SetPicksResult | SignedOut>;
}

export interface ProofDownloadsInput {
  readonly token: string;
  readonly actions: PhotosActions;
  /** Re-reads the groups after a bulk pick, so the viewer and usage stay right. */
  readonly onPicked: () => Promise<void>;
}

export interface ProofDownloads {
  readonly isSelecting: boolean;
  readonly selectedCount: number;
  readonly isSelected: (photoId: string) => boolean;
  readonly toggle: (photo: ClientPhotoView, isSelected: boolean) => void;
  readonly startSelecting: () => void;
  readonly stopSelecting: () => void;
  readonly downloadUrlOf: (photoId: string) => string;
  readonly downloadSelected: () => void;
  /** The files *Unduh semua* will fetch, while its confirm is open. */
  readonly pendingAll: readonly DownloadItem[] | null;
  readonly isListing: boolean;
  readonly askDownloadAll: () => void;
  readonly closeConfirm: () => void;
  readonly downloadAll: () => void;
  readonly isPicking: boolean;
  readonly pickSelected: (groupId: string, groupName: string) => void;
  readonly download: SequentialDownload;
  readonly failedNames: readonly string[];
}
