"use client";

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { PhotoTile } from "@/ui/patterns/photo-tile/photo-tile";
import { Button } from "@/ui/primitives/button/button";
import { Icon } from "@/ui/primitives/icon/icon";

import { AllPhotosModal } from "../all-photos-modal/all-photos-modal";
import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { galleryMediaUrl } from "../gallery-media-url/gallery-media-url";
import { photoCountsText } from "../gallery-text/gallery-text";
import { PhotosCard } from "../photos-card/photos-card";
import { BROWSE_START, useGalleryBrowse } from "../use-gallery-browse/use-gallery-browse";
import type {
  GalleryPhotosSectionProps,
  PreviewBodyProps,
  PreviewTileProps,
} from "./gallery-photos-section.types";

const MOBILE_PREVIEW = 6;
const noop = () => undefined;

/** *Foto*: counts per kind, the client-visibility line, the first photos from the Owner media endpoint and *Lihat semua foto* (AC-GAL-014, AC-GAL-015, AC-GAL-028). */
export function GalleryPhotosSection(props: Readonly<GalleryPhotosSectionProps>) {
  const { workspaceId, page } = props;
  const isMobile = useMobileViewport();
  const [isAllOpen, setIsAllOpen] = useState(false);
  const browse = useGalleryBrowse({
    workspaceId,
    galleryId: page.gallery.id,
    browseAction: props.browseAction,
  });
  const handleViewAll = () => {
    setIsAllOpen(true);
    browse.setSearchText("");
    void browse.go(BROWSE_START);
  };
  const viewAll = (
    <Button variant="secondary" iconLeading="images" onPress={handleViewAll}>
      {isMobile ? GALLERY_COPY.viewAllMobile : GALLERY_COPY.viewAll}
    </Button>
  );
  const hasPhotos = page.previewPhotos.length > 0;
  return (
    <>
      <PhotosCard
        hasPhotos={hasPhotos}
        description={
          isMobile ? GALLERY_COPY.photosDescriptionPreviewMobile : GALLERY_COPY.photosDescription
        }
        actions={hasPhotos ? viewAll : undefined}
      >
        <PreviewBody {...props} isMobile={isMobile} />
      </PhotosCard>
      {isAllOpen ? (
        <AllPhotosModal
          isOpen
          onOpenChange={setIsAllOpen}
          workspaceId={workspaceId}
          page={page}
          browse={browse}
          onOpenPhoto={props.onOpenPhoto ?? noop}
        />
      ) : null}
    </>
  );
}

function PreviewBody({ workspaceId, page, onOpenPhoto, isMobile }: Readonly<PreviewBodyProps>) {
  const { counts, status } = page.gallery;
  const photos = isMobile ? page.previewPhotos.slice(0, MOBILE_PREVIEW) : page.previewPhotos;
  const visibility =
    counts.missing > 0
      ? `${GALLERY_COPY.visibility[status]} ${GALLERY_COPY.visibilityMissing}`
      : GALLERY_COPY.visibility[status];
  return (
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
