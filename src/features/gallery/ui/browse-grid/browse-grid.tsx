"use client";

import { useIntersectionSentinel } from "@/ui/hooks/use-intersection-sentinel/use-intersection-sentinel";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { FolderTile } from "@/ui/patterns/folder-tile/folder-tile";
import { PhotoTile, PhotoTileSkeleton } from "@/ui/patterns/photo-tile/photo-tile";
import { Icon } from "@/ui/primitives/icon/icon";

import { searchMeta } from "../browse-text/browse-text";
import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { useDirectImages } from "../gallery-image-sources/gallery-image-context";
import { imageSources } from "../gallery-image-sources/gallery-image-sources";
import type {
  BrowseFolderItemProps,
  BrowseGridProps,
  BrowsePhotoItemProps,
} from "./browse-grid.types";

const GRID =
  "grid grid-cols-3 gap-x-(--space-3) gap-y-(--space-4) md:grid-cols-4 md:gap-x-(--space-4) md:gap-y-(--space-5)";
const SKELETON_ROW = 4;

function BrowseFolderItem({ folder, onOpenFolder }: Readonly<BrowseFolderItemProps>) {
  const handlePress = () => {
    onOpenFolder(folder);
  };
  return (
    <li className="min-w-0">
      <FolderTile
        name={folder.name || GALLERY_COPY.sourceFallbackName}
        countLabel={GALLERY_COPY.folderCount(folder.count)}
        onPress={handlePress}
      />
    </li>
  );
}

function BrowsePhotoItem({
  workspaceId,
  photo,
  list,
  isSearch,
  onOpenPhoto,
}: Readonly<BrowsePhotoItemProps>) {
  const image = imageSources(photo, "thumb", workspaceId, useDirectImages());
  const handlePress = () => {
    onOpenPhoto(photo, list);
  };
  return (
    <li className="min-w-0">
      <PhotoTile
        fileName={photo.fileName}
        meta={isSearch ? searchMeta(photo) : undefined}
        imageSrc={image.src}
        fallbackSrc={image.fallbackSrc}
        isMissing={photo.missing}
        onPress={handlePress}
      />
    </li>
  );
}

function Skeletons() {
  return Array.from({ length: SKELETON_ROW }, (_, index) => (
    <li key={`skeleton-${String(index)}`} className="min-w-0">
      <PhotoTileSkeleton />
    </li>
  ));
}

function BrowseEmpty({ state }: Readonly<Pick<BrowseGridProps, "state">>) {
  const { search } = state.location;
  if (search !== "")
    return (
      <EmptyState
        icon="search"
        placement="in-card"
        title={GALLERY_COPY.searchEmptyTitle(search)}
        body={GALLERY_COPY.searchEmptyBody}
      />
    );
  return (
    <EmptyState
      icon="images"
      placement="in-card"
      title={GALLERY_COPY.folderEmptyTitle}
      body={GALLERY_COPY.folderEmptyBody}
    />
  );
}

function LoadingMore() {
  return (
    <p className="flex items-center justify-center gap-(--space-2) text-(length:--font-size-body-sm) text-(--component-photo-tile-meta)">
      <Icon name="loading-03" size="sm" aria-hidden="true" className="animate-spin" />
      {GALLERY_COPY.loadingMore}
    </p>
  );
}

function BrowseItems({ workspaceId, state, onOpenFolder, onOpenPhoto }: Readonly<BrowseGridProps>) {
  if (state.isLoading) return <Skeletons />;
  const isSearch = state.location.search !== "";
  return (
    <>
      {(state.page?.folders ?? []).map((folder) => (
        <BrowseFolderItem
          key={`${folder.sourceId}/${folder.path}`}
          folder={folder}
          onOpenFolder={onOpenFolder}
        />
      ))}
      {state.photos.map((photo) => (
        <BrowsePhotoItem
          key={photo.id}
          workspaceId={workspaceId}
          photo={photo}
          list={state.photos}
          isSearch={isSearch}
          onOpenPhoto={onOpenPhoto}
        />
      ))}
      {state.isLoadingMore ? <Skeletons /> : null}
    </>
  );
}

/** The Drive-like grid of *Semua foto*: folders first, then photos at the same size, with skeletons and a sentinel for the next 48 (A-12, A-13, AC-GAL-028…030). */
export function BrowseGrid({
  workspaceId,
  state,
  onOpenFolder,
  onOpenPhoto,
  onLoadMore,
}: Readonly<BrowseGridProps>) {
  const hasMore = state.page?.nextCursor != null;
  const sentinel = useIntersectionSentinel(
    onLoadMore,
    hasMore && !state.isLoading && !state.isLoadingMore,
  );
  const isEmpty = (state.page?.folders.length ?? 0) === 0 && state.photos.length === 0;
  if (!state.isLoading && state.page !== null && isEmpty) return <BrowseEmpty state={state} />;
  return (
    <div
      aria-busy={state.isLoading || state.isLoadingMore}
      className="flex flex-col gap-(--space-5)"
    >
      <ul className={GRID}>
        <BrowseItems
          workspaceId={workspaceId}
          state={state}
          onOpenFolder={onOpenFolder}
          onOpenPhoto={onOpenPhoto}
          onLoadMore={onLoadMore}
        />
      </ul>
      {state.isLoadingMore ? <LoadingMore /> : null}
      <div ref={sentinel} aria-hidden="true" />
    </div>
  );
}
