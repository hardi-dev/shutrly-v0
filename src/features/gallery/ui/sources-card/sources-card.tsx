"use client";

import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { SOURCES_CARD_COPY_NAMESPACE } from "./sources-card.copy";
import type { SourcesCardProps } from "./sources-card.types";

/** *Sumber foto*: the linked Drive folders, or an empty state prompting the first folder (AC-GAL-014). */
export function SourcesCard({
  sources,
  actions,
  emptyAction,
  children,
}: Readonly<SourcesCardProps>) {
  const t = useTranslations(SOURCES_CARD_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  return (
    <SectionCard
      title={t("sourcesTitle")}
      description={isMobile ? undefined : t("sourcesDescription")}
      content="flush"
      actions={sources.length === 0 ? undefined : actions}
    >
      {sources.length === 0 ? (
        <div className="px-(--space-1) py-(--space-1) md:px-(--space-3)">
          <EmptyState
            icon="folder"
            placement="in-card"
            title={t("sourcesEmptyTitle")}
            body={isMobile ? t("sourcesEmptyBodyMobile") : t("sourcesEmptyBody")}
            action={emptyAction}
          />
        </div>
      ) : (
        children
      )}
    </SectionCard>
  );
}
