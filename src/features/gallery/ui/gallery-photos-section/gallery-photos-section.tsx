"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { PhotoTile } from "@/ui/patterns/photo-tile/photo-tile";
import { Icon } from "@/ui/primitives/icon/icon";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { galleryMediaUrl } from "../gallery-media-url/gallery-media-url";
import { photoCountsText } from "../gallery-text/gallery-text";
import { PhotosCard } from "../photos-card/photos-card";
import type { GalleryPhotosSectionProps, PreviewTileProps } from "./gallery-photos-section.types";

const MOBILE_PREVIEW = 6;

/** *Foto*: counts per kind, the client-visibility line and the first photos from the Owner media endpoint (AC-GAL-014, AC-GAL-015). */
export function GalleryPhotosSection({
  workspaceId,
  page,
  viewAll,
  onOpenPhoto,
}: Readonly<GalleryPhotosSectionProps>) {
  const isMobile = useMobileViewport();
  const { counts, status } = page.gallery;
  const photos = isMobile ? page.previewPhotos.slice(0, MOBILE_PREVIEW) : page.previewPhotos;
  const visibility =
    counts.missing > 0
      ? `${GALLERY_COPY.visibility[status]} ${GALLERY_COPY.visibilityMissing}`
      : GALLERY_COPY.visibility[status];
  return (
    <PhotosCard
      hasPhotos={page.previewPhotos.length > 0}
      description={
        isMobile ? GALLERY_COPY.photosDescriptionPreviewMobile : GALLERY_COPY.photosDescription
      }
      actions={viewAll}
    >
      <div className="flex flex-col gap-(--space-4) md:gap-(--space-5)">
        <p className="text-(length:--font-size-body) font-semibold text-(--component-photo-tile-name)">
          {photoCountsText(counts)}
        </p>
        <p className="flex items-start gap-(--space-2) text-(length:--font-size-body-sm) text-(--component-photo-tile-meta)">
          <Icon name="eye" size="sm" aria-hidden="true" className="mt-(--space-0-5) shrink-0" />
          {visibility}
        </p>
        <ul className="grid grid-cols-3 gap-x-(--space-3) gap-y-(--space-4) md:grid-cols-4 md:gap-x-(--space-4) md:gap-y-(--space-5)">
          {photos.map((photo) => (
            <PreviewTile
              key={photo.id}
              workspaceId={workspaceId}
              photo={photo}
              list={photos}
              onOpenPhoto={onOpenPhoto}
            />
          ))}
        </ul>
      </div>
    </PhotosCard>
  );
}

function PreviewTile({ workspaceId, photo, list, onOpenPhoto }: Readonly<PreviewTileProps>) {
  const handlePress = () => {
    onOpenPhoto?.(photo, list);
  };
  return (
    <li className="min-w-0">
      <PhotoTile
        fileName={photo.fileName}
        imageSrc={galleryMediaUrl(workspaceId, photo.id, "thumb")}
        isMissing={photo.missing}
        onPress={onOpenPhoto ? handlePress : undefined}
      />
    </li>
  );
}
