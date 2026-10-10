import type { StatusChipProps } from "@/ui/primitives/status-chip/status-chip.types";

/** One summary row on the project page's Galeri card: title, meta line and an optional chip. */
export interface GallerySummaryRow {
  readonly title: string;
  readonly meta: string;
  readonly chip: Pick<StatusChipProps, "label" | "tone"> | null;
}
