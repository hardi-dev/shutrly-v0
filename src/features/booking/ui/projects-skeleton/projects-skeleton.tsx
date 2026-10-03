"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { DataTableSkeleton } from "@/ui/patterns/data-table/data-table-skeleton";
import { ListCardItemSkeleton } from "@/ui/patterns/list-card-item/list-card-item-skeleton";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";

const COLUMNS = [
  { id: "project", label: PROJECT_COPY.columnProject },
  { id: "event", label: PROJECT_COPY.columnEvent, width: 240 },
  { id: "status", label: PROJECT_COPY.columnStatus, width: 124 },
  { id: "actions", "aria-label": PROJECT_COPY.columnActions, width: 32 },
] as const;

/** Five placeholder rows for the viewport (the list loading state; no count). */
export function ProjectsSkeleton() {
  const isMobile = useMobileViewport();
  return (
    <main className="mx-auto w-full max-w-(--size-content-narrow)" aria-busy="true">
      {isMobile ? (
        <SectionCard title={PROJECT_COPY.listTitle} content="flush">
          <ul>
            {Array.from({ length: 5 }, (_, index) => (
              <ListCardItemSkeleton key={index} isLast={index === 4} hasTrailing />
            ))}
          </ul>
        </SectionCard>
      ) : (
        <SectionCard title={PROJECT_COPY.listTitle} content="bleed">
          <DataTableSkeleton label={PROJECT_COPY.listTitle} columns={COLUMNS} rowCount={5} />
        </SectionCard>
      )}
    </main>
  );
}
