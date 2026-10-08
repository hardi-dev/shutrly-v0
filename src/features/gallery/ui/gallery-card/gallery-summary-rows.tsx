import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import type { GallerySummaryRowsProps } from "./gallery-card.types";

/** The Galeri card's *Pilihan klien* and *Hasil akhir* rows: title, meta and status chip (Owner 7 `r71J5`, `QUSVb`). */
export function GallerySummaryRows({ rows }: Readonly<GallerySummaryRowsProps>) {
  if (rows.length === 0) return null;
  return (
    <ul className="flex flex-col gap-(--space-3)">
      {rows.map((row) => (
        <li key={row.title} className="flex items-center gap-(--space-3)">
          <span className="flex min-w-0 flex-1 flex-col gap-(--space-0-5)">
            <span className="text-(length:--font-size-body) font-medium text-(--color-semantic-text-primary)">
              {row.title}
            </span>
            <span className="text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
              {row.meta}
            </span>
          </span>
          {row.chip ? <StatusChip {...row.chip} hasDot /> : null}
        </li>
      ))}
    </ul>
  );
}
