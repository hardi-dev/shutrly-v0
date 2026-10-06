import type { SelectionCardState } from "@/features/gallery/domain/selection-group-status/selection-group-status.types";

import type { SelectionOwnerReaderPort } from "../../ports/selection-owner-reader/selection-owner-reader.port";
import type {
  SelectionGroupRecord,
  SelectionRepositoryPort,
} from "../../ports/selection-repository/selection-repository.port";

/** A selection group as the Owner sees it: status, usage against the effective limit, notes and when it changed (card and pages, A-34). */
export interface OwnerGroupView {
  readonly id: string;
  readonly name: string;
  readonly unit: string | null;
  readonly mode: SelectionGroupRecord["mode"];
  readonly status: SelectionGroupRecord["status"];
  readonly usage: number;
  readonly limit: number;
  readonly pickCount: number;
  readonly noteCount: number;
  /** ISO instants, null while they don't apply. */
  readonly submittedAt: string | null;
  readonly lockedAt: string | null;
}

export interface SelectionOwnerDeps {
  readonly selections: SelectionRepositoryPort;
  readonly owner: SelectionOwnerReaderPort;
}

/** The *Pilihan klien* card (card export states A–E). */
export interface SelectionCardView {
  readonly projectTitle: string;
  readonly state: SelectionCardState;
  readonly groups: readonly OwnerGroupView[];
  readonly galleryExists: boolean;
}
