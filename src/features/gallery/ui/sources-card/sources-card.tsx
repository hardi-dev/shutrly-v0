"use client";

import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { SOURCES_CARD_COPY_NAMESPACE } from "./sources-card.copy";
import type { SourcesCardProps } from "./sources-card.types";

/** *Sumber foto*: the linked Drive folders, or the no-folder text; the empty state puts *Tambah folder* in the header (AC-GAL-014, design `galeri-belum-ada-folder`). */
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
      actions={sources.length === 0 ? emptyAction : actions}
    >
      {sources.length === 0 ? (
        <div className="px-(--space-1) py-(--space-1) md:px-(--space-3)">
          <p className="p-(--space-3) text-(length:--font-size-body) text-(--color-semantic-text-primary)">
            {t("sourcesEmptyBody")}
          </p>
        </div>
      ) : (
        children
      )}
    </SectionCard>
  );
}
