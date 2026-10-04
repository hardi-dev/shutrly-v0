"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { AccessCard } from "../access-card/access-card";
import { GalleryLifecycle } from "../gallery-lifecycle/gallery-lifecycle";
import { GalleryPhotosSection } from "../gallery-photos-section/gallery-photos-section";
import { GallerySourcesSection } from "../gallery-sources-section/gallery-sources-section";
import { GalleryStateAlert } from "../gallery-state-alert/gallery-state-alert";
import { galleryMetaText, galleryStatusChip } from "../gallery-text/gallery-text";
import type { GalleryPageScreenProps } from "./gallery-page-screen.types";

/** The gallery page (design.md › Layout): *Akses klien*, *Sumber foto* and *Foto* in the wide column. */
export function GalleryPageScreen({
  workspaceId,
  page,
  actions,
}: Readonly<GalleryPageScreenProps>) {
  const isMobile = useMobileViewport();
  const { gallery } = page;
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-max) flex-col gap-(--space-4) pb-(--space-6) md:gap-(--component-panel-app-content-gap)">
      {isMobile ? (
        <header className="flex flex-col items-start gap-(--space-2)">
          <StatusChip {...galleryStatusChip(gallery.status)} />
          <p className="text-(length:--font-size-body-sm) text-(--component-page-header-subtitle)">
            {galleryMetaText(gallery, null)}
          </p>
        </header>
      ) : null}
      <GalleryStateAlert gallery={gallery} />
      <AccessCard gallery={gallery} />
      <GallerySourcesSection workspaceId={workspaceId} page={page} actions={actions} />
      <GalleryPhotosSection
        workspaceId={workspaceId}
        page={page}
        browseAction={actions.browseAction}
      />
      <GalleryLifecycle workspaceId={workspaceId} page={page} actions={actions} />
    </main>
  );
}
