"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { PhotosCardProps } from "./photos-card.types";

/** *Foto*: the counts, visibility and the first photos, or an empty state before the first sync (AC-GAL-014). */
export function PhotosCard({
  hasPhotos,
  description,
  actions,
  children,
}: Readonly<PhotosCardProps>) {
  const isMobile = useMobileViewport();
  const emptyDescription = isMobile
    ? GALLERY_COPY.photosDescriptionMobile
    : GALLERY_COPY.photosDescriptionEmpty;
  return (
    <SectionCard
      title={GALLERY_COPY.photosTitle}
      description={hasPhotos ? description : emptyDescription}
      actions={actions}
    >
      {hasPhotos ? (
        children
      ) : (
        <EmptyState
          icon="images"
          placement="in-card"
          title={GALLERY_COPY.photosEmptyTitle}
          body={GALLERY_COPY.photosEmptyBody}
        />
      )}
    </SectionCard>
  );
}
