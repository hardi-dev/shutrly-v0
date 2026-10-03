"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { DataTableSkeleton } from "@/ui/patterns/data-table/data-table-skeleton";
import { ListCardItemSkeleton } from "@/ui/patterns/list-card-item/list-card-item-skeleton";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";

const COLUMNS = [
  { id: "name", label: "KLIEN" },
  { id: "whatsapp", label: "WHATSAPP", width: 184 },
  { id: "social", label: "MEDIA SOSIAL", width: 240 },
  { id: "actions", "aria-label": "Aksi", width: 32 },
] as const;

/** Renders five list placeholders appropriate to the current viewport. */
export function ClientsSkeleton() {
  const isMobile = useMobileViewport();
  if (!isMobile)
    return (
      <main className="mx-auto w-full max-w-(--size-content-narrow)" aria-busy="true">
        <SectionCard title={CLIENT_COPY.listTitle} content="bleed">
          <DataTableSkeleton label={CLIENT_COPY.listTitle} columns={COLUMNS} rowCount={5} />
        </SectionCard>
      </main>
    );
  return (
    <main className="mx-auto w-full max-w-(--size-content-narrow)" aria-busy="true">
      <SectionCard title={CLIENT_COPY.listTitle} content="flush">
        <ul>
          {Array.from({ length: 5 }, (_, index) => (
            <ListCardItemSkeleton key={index} isLast={index === 4} />
          ))}
        </ul>
      </SectionCard>
    </main>
  );
}
