import type {
  DeliveryFilesView,
  DeliveryFileView,
} from "@/features/gallery/application/use-cases/get-delivery-files/get-delivery-files.types";

import type { SequentialDownload } from "../use-sequential-download/use-sequential-download.types";

export type DeliveryKind = "EDITED" | "PRINT";

/** Everything the *Hasil akhir* page renders from (klien-8 states). */
export interface DeliveryScreenState {
  readonly files: DeliveryFilesView;
  readonly kind: DeliveryKind;
  readonly setKind: (kind: DeliveryKind) => void;
  /** The open kind's files. */
  readonly shown: readonly DeliveryFileView[];
  readonly isSelecting: boolean;
  readonly selectedIds: ReadonlySet<string>;
  readonly toggle: (id: string, isSelected: boolean) => void;
  readonly startSelecting: () => void;
  readonly stopSelecting: () => void;
  readonly downloadSelected: () => void;
  readonly isConfirmOpen: boolean;
  readonly askDownloadAll: () => void;
  readonly closeConfirm: () => void;
  readonly downloadAll: () => void;
  readonly viewerIndex: number | null;
  readonly setViewerIndex: (index: number | null) => void;
  readonly download: SequentialDownload;
  /** File names of the last run's failures, for the alert. */
  readonly failedNames: readonly string[];
}
