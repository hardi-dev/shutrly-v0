"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { DataTableSkeleton } from "@/ui/patterns/data-table/data-table-skeleton";
import { ListCardItemSkeleton } from "@/ui/patterns/list-card-item/list-card-item-skeleton";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { TEAM_COPY } from "../team-copy/team-copy.copy";

const COLUMNS = [
  { id: "member", label: TEAM_COPY.memberColumn },
  { id: "whatsapp", label: TEAM_COPY.whatsappColumn, width: 184 },
  { id: "roles", label: TEAM_COPY.memberRolesColumn, width: 200 },
  { id: "actions", "aria-label": TEAM_COPY.actionsColumn, width: 32 },
] as const;

/**
 * Placeholder rows for the *Anggota* tabs while they load.
 * @returns a skeleton fitted to the current viewport
 */
export function TeamMembersSkeleton() {
  const isMobile = useMobileViewport();
  return (
    <main className="mx-auto w-full max-w-(--size-content-narrow)" aria-busy="true">
      <SectionCard title={TEAM_COPY.membersTitle} content={isMobile ? "flush" : "bleed"}>
        {isMobile ? (
          <ul>
            {Array.from({ length: 5 }, (_, index) => (
              <ListCardItemSkeleton key={index} isLast={index === 4} />
            ))}
          </ul>
        ) : (
          <DataTableSkeleton label={TEAM_COPY.membersTitle} columns={COLUMNS} rowCount={5} />
        )}
      </SectionCard>
    </main>
  );
}
