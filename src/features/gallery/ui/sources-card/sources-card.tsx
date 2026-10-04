"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { SourcesCardProps } from "./sources-card.types";

/** *Sumber foto*: the linked Drive folders, or an empty state prompting the first folder (AC-GAL-014). */
export function SourcesCard({
  sources,
  actions,
  emptyAction,
  children,
}: Readonly<SourcesCardProps>) {
  const isMobile = useMobileViewport();
  return (
    <SectionCard
      title={GALLERY_COPY.sourcesTitle}
      description={isMobile ? undefined : GALLERY_COPY.sourcesDescription}
      content="flush"
      actions={sources.length === 0 ? undefined : actions}
    >
      {sources.length === 0 ? (
        <div className="px-(--space-1) py-(--space-1) md:px-(--space-3)">
          <EmptyState
            icon="folder"
            placement="in-card"
            title={GALLERY_COPY.sourcesEmptyTitle}
            body={isMobile ? GALLERY_COPY.sourcesEmptyBodyMobile : GALLERY_COPY.sourcesEmptyBody}
            action={emptyAction}
          />
        </div>
      ) : (
        children
      )}
    </SectionCard>
  );
}
