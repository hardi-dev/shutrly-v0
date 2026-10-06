"use client";

import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";
import { MediaViewer } from "@/ui/patterns/media-viewer/media-viewer";
import type { MediaViewerItem } from "@/ui/patterns/media-viewer/media-viewer.types";

import { CLIENT_BROWSE_COPY } from "../client-browse-screen/client-browse-screen.copy";
import type { ClientPhotoViewerProps } from "./client-photo-viewer.types";

/** The client's photo viewer on the shared MediaViewer: preview size with the media-route fallback, file name and folder (pratinjau NxnKv / h6GAvI). @param props - the photo list, open index, handlers and optional actions @returns the viewer */
export function ClientPhotoViewer({
  photos,
  index,
  onIndexChange,
  onClose,
  renderActions,
  renderFooter,
  metaOf,
}: Readonly<ClientPhotoViewerProps>) {
  const byId = new Map(photos.map((photo) => [photo.id, photo]));
  const items: MediaViewerItem[] = photos.map((photo) => ({
    id: photo.id,
    title: photo.fileName,
    meta: metaOf?.(photo) ?? photo.folderPath,
    isMissing: photo.missing,
  }));
  const imageOf = (item: MediaViewerItem, size: "stage" | "thumb") => {
    const photo = byId.get(item.id);
    return size === "stage" ? photo?.preview : photo?.thumb;
  };
  const stageSrc = (item: MediaViewerItem, size: "stage" | "thumb") =>
    imageOf(item, size)?.src ?? "";
  const stageFallback = (item: MediaViewerItem, size: "stage" | "thumb") =>
    imageOf(item, size)?.fallbackSrc;
  const actionsFor = (item: MediaViewerItem) => {
    const photo: ClientPhotoView | undefined = byId.get(item.id);
    return photo && renderActions ? renderActions(photo) : null;
  };
  const footerFor = (item: MediaViewerItem) => {
    const photo = byId.get(item.id);
    return photo && renderFooter ? renderFooter(photo) : null;
  };
  return (
    <MediaViewer
      items={items}
      index={index}
      onIndexChange={onIndexChange}
      onClose={onClose}
      imageSrc={stageSrc}
      imageFallbackSrc={stageFallback}
      missingText={CLIENT_BROWSE_COPY.viewerMissing}
      renderActions={renderActions ? actionsFor : undefined}
      renderFooter={renderFooter ? footerFor : undefined}
    />
  );
}
