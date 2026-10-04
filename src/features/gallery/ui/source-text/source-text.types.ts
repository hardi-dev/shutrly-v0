import type { StatusChipProps } from "@/ui/primitives/status-chip/status-chip.types";

// The client's view of a source while *Sinkronkan* / *Sinkronkan semua* runs (D-9).
export type SourceSyncPhase = "QUEUED" | "SYNCING" | null;

export interface SourceRowText {
  readonly title: string;
  readonly meta: string;
  readonly metaTone: "default" | "danger";
  readonly chip: Pick<StatusChipProps, "tone" | "label" | "hasDot">;
}
