import type { OwnerGroupView } from "../owner-selection-views/owner-selection-views.types";

/** A pick with the photo facts the Owner needs: name, folder, quantity, note, and whether the file is gone (A-8, AC-SEL-015). */
export interface OwnerPickView {
  readonly photoId: string;
  readonly fileName: string;
  readonly folderPath: string;
  readonly quantity: number;
  readonly note: string | null;
  readonly missing: boolean;
}

export interface SelectionGroupDetailView {
  readonly projectTitle: string;
  readonly group: OwnerGroupView;
  /** Picks in file-name order, missing photos included: they still count (A-8). */
  readonly picks: readonly OwnerPickView[];
  /** The latest change to any pick of the group, ISO; null with no picks (the *Waktu* of an open group). */
  readonly changedAt: string | null;
  readonly missingCount: number;
  readonly missingNames: readonly string[];
}
