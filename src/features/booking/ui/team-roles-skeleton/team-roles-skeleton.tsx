"use client";

import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { DataTableSkeleton } from "@/ui/patterns/data-table/data-table-skeleton";
import { ListCardItemSkeleton } from "@/ui/patterns/list-card-item/list-card-item-skeleton";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import type { TeamTranslate } from "../team-copy/team-copy.types";
import { TEAM_ROLES_SKELETON_COPY_NAMESPACE } from "./team-roles-skeleton.copy";

function roleColumns(t: TeamTranslate) {
  return [
    { id: "role", label: t("roleColumn") },
    { id: "usage", label: t("usageColumn"), width: 184 },
    { id: "actions", "aria-label": t("actionsColumn"), width: 32 },
  ] as const;
}

/**
 * Placeholder rows for the *Peran* tab while it loads.
 * @returns a skeleton fitted to the current viewport
 */
export function TeamRolesSkeleton() {
  const t = useTranslations(TEAM_ROLES_SKELETON_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  return (
    <main className="mx-auto w-full max-w-(--size-content-narrow)" aria-busy="true">
      <SectionCard title={t("rolesTitle")} content={isMobile ? "flush" : "bleed"}>
        {isMobile ? (
          <ul>
            {Array.from({ length: 5 }, (_, index) => (
              <ListCardItemSkeleton key={index} isLast={index === 4} />
            ))}
          </ul>
        ) : (
          <DataTableSkeleton label={t("rolesTitle")} columns={roleColumns(t)} rowCount={5} />
        )}
      </SectionCard>
    </main>
  );
}
