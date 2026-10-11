"use client";

import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { DataTableSkeleton } from "@/ui/patterns/data-table/data-table-skeleton";
import { ListCardItemSkeleton } from "@/ui/patterns/list-card-item/list-card-item-skeleton";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { PROJECTS_SKELETON_COPY_NAMESPACE } from "./projects-skeleton.copy";

/** Five placeholder rows for the viewport (the list loading state; no count). */
export function ProjectsSkeleton() {
  const t = useTranslations(PROJECTS_SKELETON_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const columns = [
    { id: "project", label: t("columnProject") },
    { id: "event", label: t("columnEvent"), width: 240 },
    { id: "status", label: t("columnStatus"), width: 124 },
    { id: "actions", "aria-label": t("columnActions"), width: 32 },
  ] as const;
  return (
    <main className="mx-auto w-full max-w-(--size-content-narrow)" aria-busy="true">
      {isMobile ? (
        <SectionCard title={t("listTitle")} content="flush">
          <ul>
            {Array.from({ length: 5 }, (_, index) => (
              <ListCardItemSkeleton key={index} isLast={index === 4} hasTrailing />
            ))}
          </ul>
        </SectionCard>
      ) : (
        <SectionCard title={t("listTitle")} content="bleed">
          <DataTableSkeleton label={t("listTitle")} columns={columns} rowCount={5} />
        </SectionCard>
      )}
    </main>
  );
}
