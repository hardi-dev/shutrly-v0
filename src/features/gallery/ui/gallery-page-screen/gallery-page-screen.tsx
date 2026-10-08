"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { GalleryLifecycle } from "../gallery-lifecycle/gallery-lifecycle";
import { GalleryPhotosSection } from "../gallery-photos-section/gallery-photos-section";
import { GallerySourcesSection } from "../gallery-sources-section/gallery-sources-section";
import { GalleryStateAlert } from "../gallery-state-alert/gallery-state-alert";
import { galleryMetaText, galleryStatusChip } from "../gallery-text/gallery-text";
import type { GalleryPageScreenProps } from "./gallery-page-screen.types";

/** The gallery page (Owner 7, A-34): *Akses klien*, *Pilihan klien*, *Hasil akhir*, *Sumber foto* and *Foto*, all in the 720 column. */
export function GalleryPageScreen({
  workspaceId,
  page,
  actions,
  initialSyncSourceId,
  accessCard,
  selectionCard,
  deliveryCard,
}: Readonly<GalleryPageScreenProps>) {
  const isMobile = useMobileViewport();
  const { gallery } = page;
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-4) pb-(--space-6) md:gap-(--component-panel-app-content-gap)">
      {isMobile ? (
        <header className="flex flex-col items-start gap-(--space-2)">
          <StatusChip {...galleryStatusChip(gallery.status)} />
          <p className="text-(length:--font-size-body-sm) text-(--component-page-header-subtitle)">
            {galleryMetaText(gallery, null)}
          </p>
        </header>
      ) : null}
      <GalleryStateAlert gallery={gallery} projectStatus={page.project.status} />
      {accessCard}
      {selectionCard}
      {deliveryCard}
      <GallerySourcesSection
        workspaceId={workspaceId}
        page={page}
        actions={actions}
        initialSyncSourceId={initialSyncSourceId}
      />
      <GalleryPhotosSection
        workspaceId={workspaceId}
        page={page}
        browseAction={actions.browseAction}
      />
      <GalleryLifecycle workspaceId={workspaceId} page={page} actions={actions} />
    </main>
  );
}
