"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { AccessCard } from "../access-card/access-card";
import { galleryMetaText, galleryStatusChip } from "../gallery-text/gallery-text";
import { PhotosCard } from "../photos-card/photos-card";
import { SourcesCard } from "../sources-card/sources-card";
import type { GalleryPageScreenProps } from "./gallery-page-screen.types";

/** The gallery page (design.md › Layout): *Akses klien*, *Sumber foto* and *Foto* in the wide column. */
export function GalleryPageScreen({ page }: Readonly<GalleryPageScreenProps>) {
  const isMobile = useMobileViewport();
  const { gallery } = page;
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-max) flex-col gap-(--space-4) pb-(--space-6) md:gap-(--component-panel-app-content-gap)">
      {isMobile ? (
        <header className="flex flex-col items-start gap-(--space-2)">
          <StatusChip {...galleryStatusChip(gallery.status)} />
          <p className="text-(length:--font-size-label) text-(--component-input-helper)">
            {galleryMetaText(gallery, null)}
          </p>
        </header>
      ) : null}
      <AccessCard gallery={gallery} />
      <SourcesCard sources={page.sources} />
      <PhotosCard
        hasPhotos={gallery.counts.proof + gallery.counts.edited + gallery.counts.print > 0}
      />
    </main>
  );
}
