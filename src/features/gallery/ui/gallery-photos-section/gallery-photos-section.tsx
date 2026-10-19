"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { PhotoTile } from "@/ui/patterns/photo-tile/photo-tile";
import { Button } from "@/ui/primitives/button/button";
import { Icon } from "@/ui/primitives/icon/icon";

import { AllPhotosModal } from "../all-photos-modal/all-photos-modal";
import {
  GalleryImageProvider,
  useDirectImages,
} from "../gallery-image-sources/gallery-image-context";
import { imageSources } from "../gallery-image-sources/gallery-image-sources";
import { galleryVisibilityText, photoCountsText } from "../gallery-text/gallery-text";
import { PhotoPreview } from "../photo-preview/photo-preview";
import { PhotosCard } from "../photos-card/photos-card";
import { BROWSE_START, useGalleryBrowse } from "../use-gallery-browse/use-gallery-browse";
import { usePhotoPreview } from "../use-photo-preview/use-photo-preview";
import { GALLERY_PHOTOS_SECTION_COPY_NAMESPACE } from "./gallery-photos-section.copy";
import type {
  GalleryPhotosSectionProps,
  PreviewBodyProps,
  PreviewTileProps,
  ViewAllButtonProps,
} from "./gallery-photos-section.types";

/** *Foto*: counts per kind, the client-visibility line, the first photos from the Owner media endpoint and *Lihat semua foto* (AC-GAL-014, AC-GAL-015, AC-GAL-028). */
export function GalleryPhotosSection(props: Readonly<GalleryPhotosSectionProps>) {
  const t = useTranslations(GALLERY_PHOTOS_SECTION_COPY_NAMESPACE);
  const { workspaceId, page } = props;
  const isMobile = useMobileViewport();
  const [isAllOpen, setIsAllOpen] = useState(false);
  const browse = useGalleryBrowse({
    workspaceId,
    galleryId: page.gallery.id,
    browseAction: props.browseAction,
  });
  const preview = usePhotoPreview(browse);
  const handleViewAll = () => {
    setIsAllOpen(true);
    browse.setSearchText("");
    void browse.go(BROWSE_START);
  };
  const hasPhotos = page.previewPhotos.length > 0;
  return (
    <GalleryImageProvider directImages={page.directImages}>
      <PhotosCard
        hasPhotos={hasPhotos}
        description={isMobile ? undefined : t("photosDescription")}
        actions={hasPhotos ? <ViewAllButton onPress={handleViewAll} /> : undefined}
      >
        <PreviewBody {...props} onOpenPhoto={preview.openFromCard} />
      </PhotosCard>
      {isAllOpen ? (
        <AllPhotosModal
          isOpen
          onOpenChange={setIsAllOpen}
          workspaceId={workspaceId}
          page={page}
          browse={browse}
          onOpenPhoto={preview.openFromBrowse}
        />
      ) : null}
      <PhotoPreview
        workspaceId={workspaceId}
        photos={preview.photos}
        index={preview.index}
        total={preview.total}
        onIndexChange={preview.handleIndexChange}
        onClose={preview.close}
      />
    </GalleryImageProvider>
  );
}

function ViewAllButton({ onPress }: Readonly<ViewAllButtonProps>) {
  const t = useTranslations(GALLERY_PHOTOS_SECTION_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  return (
    <Button variant="secondary" iconLeading="images" onPress={onPress}>
      {isMobile ? t("viewAllMobile") : t("viewAll")}
    </Button>
  );
}

function PreviewBody({ workspaceId, page, onOpenPhoto }: Readonly<PreviewBodyProps>) {
  const t = useTranslations(GALLERY_PHOTOS_SECTION_COPY_NAMESPACE);
  const { counts, state } = page.gallery;
  const photos = page.previewPhotos;
  const visibility =
    counts.missing > 0
      ? `${galleryVisibilityText(t, state)} ${t("visibilityMissing")}`
      : galleryVisibilityText(t, state);
  return (
    <div className="flex flex-col gap-(--space-4) md:gap-(--space-5)">
      <p className="text-(length:--font-size-body) font-semibold text-(--component-photo-tile-name)">
        {photoCountsText(t, counts)}
      </p>
      <p className="flex items-start gap-(--space-2) text-(length:--font-size-body-sm) text-(--component-photo-tile-meta)">
        <Icon name="eye" size="sm" aria-hidden="true" className="mt-(--space-0-5) shrink-0" />
        {visibility}
      </p>
      <ul className="grid grid-cols-3 gap-x-(--space-3) gap-y-(--space-4) md:gap-x-(--space-4) md:gap-y-(--space-5)">
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
  const image = imageSources(photo, "thumb", workspaceId, useDirectImages());
  const handlePress = () => {
    onOpenPhoto(photo, list);
  };
  return (
    <li className="min-w-0">
      <PhotoTile
        fileName={photo.fileName}
        imageSrc={image.src}
        fallbackSrc={image.fallbackSrc}
        isMissing={photo.missing}
        onPress={handlePress}
      />
    </li>
  );
}
