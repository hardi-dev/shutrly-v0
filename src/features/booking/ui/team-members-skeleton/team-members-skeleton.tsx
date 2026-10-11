"use client";

import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { DataTableSkeleton } from "@/ui/patterns/data-table/data-table-skeleton";
import { ListCardItemSkeleton } from "@/ui/patterns/list-card-item/list-card-item-skeleton";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import type { TeamTranslate } from "../team-copy/team-copy.types";
import { TEAM_MEMBERS_SKELETON_COPY_NAMESPACE } from "./team-members-skeleton.copy";

function memberColumns(t: TeamTranslate) {
  return [
    { id: "member", label: t("memberColumn") },
    { id: "whatsapp", label: t("whatsappColumn"), width: 184 },
    { id: "roles", label: t("memberRolesColumn"), width: 200 },
    { id: "actions", "aria-label": t("actionsColumn"), width: 32 },
  ] as const;
}

/**
 * Placeholder rows for the *Anggota* tabs while they load.
 * @returns a skeleton fitted to the current viewport
 */
export function TeamMembersSkeleton() {
  const t = useTranslations(TEAM_MEMBERS_SKELETON_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  return (
    <main className="mx-auto w-full max-w-(--size-content-narrow)" aria-busy="true">
      <SectionCard title={t("membersTitle")} content={isMobile ? "flush" : "bleed"}>
        {isMobile ? (
          <ul>
            {Array.from({ length: 5 }, (_, index) => (
              <ListCardItemSkeleton key={index} isLast={index === 4} />
            ))}
          </ul>
        ) : (
          <DataTableSkeleton label={t("membersTitle")} columns={memberColumns(t)} rowCount={5} />
        )}
      </SectionCard>
    </main>
  );
}
