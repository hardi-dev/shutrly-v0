"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { MediaViewer } from "@/ui/patterns/media-viewer/media-viewer";
import type { MediaViewerItem } from "@/ui/patterns/media-viewer/media-viewer.types";
import { Button } from "@/ui/primitives/button/button";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { galleryMediaUrl } from "../gallery-media-url/gallery-media-url";
import type { PhotoPreviewProps } from "./photo-preview.types";
import { previewMeta } from "./photo-preview-meta";

/** The immersive photo preview: Owner-only media, the top-bar meta and *Buka di Google Drive* except for a missing file (AC-GAL-031, D-10, D-11). */
export function PhotoPreview(props: Readonly<PhotoPreviewProps>) {
  const isMobile = useMobileViewport();
  const { photos, workspaceId } = props;
  const items = photos.map((photo, position) => ({
    id: photo.id,
    title: photo.fileName,
    meta: previewMeta(photo, position + 1, Math.max(props.total, photos.length)),
    isMissing: photo.missing,
  }));
  const imageSrc = (item: MediaViewerItem, size: "stage" | "thumb") =>
    galleryMediaUrl(workspaceId, item.id, size === "stage" ? "preview" : "thumb");
  const renderActions = (item: MediaViewerItem) => {
    const driveUrl = photos.find((photo) => photo.id === item.id)?.driveUrl ?? null;
    if (driveUrl === null) return null;
    if (isMobile) {
      return (
        <IconButton
          icon="external-link"
          aria-label={GALLERY_COPY.openInDriveMobile}
          href={driveUrl}
          target="_blank"
          className="text-(--component-media-viewer-text)"
        />
      );
    }
    return (
      <Button variant="secondary" iconLeading="external-link" href={driveUrl} target="_blank">
        {GALLERY_COPY.openInDrive}
      </Button>
    );
  };
  return (
    <MediaViewer
      items={items}
      index={props.index}
      onIndexChange={props.onIndexChange}
      onClose={props.onClose}
      imageSrc={imageSrc}
      missingText={GALLERY_COPY.previewMissing}
      renderActions={renderActions}
    />
  );
}
