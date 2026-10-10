import type { StatusChipProps } from "@/ui/primitives/status-chip/status-chip.types";

/** One row of the *Hasil akhir* card: a title, a line and its chip (states B–D). */
export interface DeliveryRow {
  readonly key: string;
  readonly title: string;
  readonly meta: string;
  readonly chip: Pick<StatusChipProps, "label" | "tone">;
}
