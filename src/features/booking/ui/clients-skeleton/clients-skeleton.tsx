"use client";

import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { DataTableSkeleton } from "@/ui/patterns/data-table/data-table-skeleton";
import { ListCardItemSkeleton } from "@/ui/patterns/list-card-item/list-card-item-skeleton";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import type { ClientTranslate } from "../client-copy/client-copy.types";
import { CLIENTS_SKELETON_COPY_NAMESPACE } from "./clients-skeleton.copy";

function clientColumns(t: ClientTranslate) {
  return [
    { id: "name", label: t("columnClient") },
    { id: "whatsapp", label: t("columnWhatsapp"), width: 184 },
    { id: "social", label: t("columnSocial"), width: 240 },
    { id: "actions", "aria-label": t("columnActions"), width: 32 },
  ] as const;
}

/** Renders five list placeholders appropriate to the current viewport. */
export function ClientsSkeleton() {
  const isMobile = useMobileViewport();
  const t = useTranslations(CLIENTS_SKELETON_COPY_NAMESPACE);
  if (!isMobile)
    return (
      <main className="mx-auto w-full max-w-(--size-content-narrow)" aria-busy="true">
        <SectionCard title={t("listTitle")} content="bleed">
          <DataTableSkeleton label={t("listTitle")} columns={clientColumns(t)} rowCount={5} />
        </SectionCard>
      </main>
    );
  return (
    <main className="mx-auto w-full max-w-(--size-content-narrow)" aria-busy="true">
      <SectionCard title={t("listTitle")} content="flush">
        <ul>
          {Array.from({ length: 5 }, (_, index) => (
            <ListCardItemSkeleton key={index} isLast={index === 4} />
          ))}
        </ul>
      </SectionCard>
    </main>
  );
}
