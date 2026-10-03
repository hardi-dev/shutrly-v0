"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { DataTableSkeleton } from "@/ui/patterns/data-table/data-table-skeleton";
import { ListCardItemSkeleton } from "@/ui/patterns/list-card-item/list-card-item-skeleton";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { TEAM_COPY } from "../team-copy/team-copy.copy";

const COLUMNS = [
  { id: "role", label: TEAM_COPY.roleColumn },
  { id: "usage", label: TEAM_COPY.usageColumn, width: 184 },
  { id: "actions", "aria-label": TEAM_COPY.actionsColumn, width: 32 },
] as const;

/**
 * Placeholder rows for the *Peran* tab while it loads.
 * @returns a skeleton fitted to the current viewport
 */
export function TeamRolesSkeleton() {
  const isMobile = useMobileViewport();
  return (
    <main className="mx-auto w-full max-w-(--size-content-narrow)" aria-busy="true">
      <SectionCard title={TEAM_COPY.rolesTitle} content={isMobile ? "flush" : "bleed"}>
        {isMobile ? (
          <ul>
            {Array.from({ length: 5 }, (_, index) => (
              <ListCardItemSkeleton key={index} isLast={index === 4} />
            ))}
          </ul>
        ) : (
          <DataTableSkeleton label={TEAM_COPY.rolesTitle} columns={COLUMNS} rowCount={5} />
        )}
      </SectionCard>
    </main>
  );
}
