"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";

import { SetupGuideCard } from "../setup-guide-card/setup-guide-card";
import { SOURCE_COPY } from "../source-copy/source-copy.copy";
import { PhotoSourceRow } from "../source-row/source-row";
import type { PhotoSourcesScreenProps } from "./photo-sources-screen.types";

export function PhotoSourcesScreen({ sources }: PhotoSourcesScreenProps) {
  const isMobile = useMobileViewport();
  const addButton = (
    <Button variant="secondary" iconLeading="plus">
      {SOURCE_COPY.add}
    </Button>
  );

  return (
    <main
      id="photo-sources-content"
      className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--component-panel-app-content-gap)"
    >
      {!isMobile ? <PageActions>{addButton}</PageActions> : null}
      <SectionCard
        title={SOURCE_COPY.listTitle}
        description={isMobile ? SOURCE_COPY.listDescriptionMobile : SOURCE_COPY.listDescription}
        content="flush"
        actions={
          isMobile ? (
            <Button variant="secondary" iconLeading="plus">
              {SOURCE_COPY.addShort}
            </Button>
          ) : undefined
        }
      >
        {sources.length > 0 ? (
          <ul aria-label={SOURCE_COPY.listTitle}>
            {sources.map((source, index) => (
              <PhotoSourceRow
                key={source.id}
                source={source}
                isLast={index === sources.length - 1}
              />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="folder-open"
            title={SOURCE_COPY.emptyTitle}
            body={SOURCE_COPY.emptyBody}
            action={addButton}
          />
        )}
      </SectionCard>
      <SetupGuideCard isMobile={isMobile} />
    </main>
  );
}
