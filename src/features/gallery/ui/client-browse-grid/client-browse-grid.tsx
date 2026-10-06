"use client";

import { useIntersectionSentinel } from "@/ui/hooks/use-intersection-sentinel/use-intersection-sentinel";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { FolderTile } from "@/ui/patterns/folder-tile/folder-tile";
import { PhotoTile, PhotoTileSkeleton } from "@/ui/patterns/photo-tile/photo-tile";
import { Icon } from "@/ui/primitives/icon/icon";

import { CLIENT_BROWSE_COPY as COPY } from "../client-browse-screen/client-browse-screen.copy";
import type {
  ClientBrowseGridProps,
  ClientFolderItemProps,
  ClientPhotoItemProps,
} from "./client-browse-grid.types";

// A-28: 4 columns on desktop, 2 on phones; a short last row keeps the column width.
export const CLIENT_GRID =
  "grid grid-cols-2 gap-x-(--space-2) gap-y-(--space-4) md:grid-cols-4 md:gap-x-(--space-4)";
const SKELETONS = 8;

function FolderItem({ folder, onOpenFolder }: Readonly<ClientFolderItemProps>) {
  const handlePress = () => {
    onOpenFolder(folder);
  };
  return (
    <li className="min-w-0">
      <FolderTile
        name={folder.name || COPY.folderFallbackName}
        countLabel={COPY.folderCount(folder.count)}
        onPress={handlePress}
      />
    </li>
  );
}

function PhotoItem({ photo, index, onOpenPhoto }: Readonly<ClientPhotoItemProps>) {
  const handlePress = () => {
    onOpenPhoto(index);
  };
  return (
    <li className="min-w-0">
      <PhotoTile
        fileName={photo.fileName}
        imageSrc={photo.thumb.src}
        fallbackSrc={photo.thumb.fallbackSrc}
        isMissing={photo.missing}
        onPress={handlePress}
      />
    </li>
  );
}

function Skeletons() {
  return Array.from({ length: SKELETONS }, (_, index) => (
    <li key={`skeleton-${String(index)}`} className="min-w-0">
      <PhotoTileSkeleton />
    </li>
  ));
}

function Empty({ search }: Readonly<{ search: string }>) {
  return search === "" ? (
    <EmptyState icon="images" placement="in-card" title={COPY.emptyTitle} body={COPY.emptyBody} />
  ) : (
    <EmptyState
      icon="search"
      placement="in-card"
      title={COPY.searchEmptyTitle(search)}
      body={COPY.searchEmptyBody}
    />
  );
}

function GridItems({
  state,
  onOpenFolder,
  onOpenPhoto,
}: Readonly<Omit<ClientBrowseGridProps, "onLoadMore">>) {
  if (state.isLoading) return <Skeletons />;
  return (
    <>
      {(state.page?.folders ?? []).map((folder) => (
        <FolderItem
          key={`${folder.sourceId}/${folder.path}`}
          folder={folder}
          onOpenFolder={onOpenFolder}
        />
      ))}
      {state.photos.map((photo, index) => (
        <PhotoItem key={photo.id} photo={photo} index={index} onOpenPhoto={onOpenPhoto} />
      ))}
    </>
  );
}

function LoadingMore() {
  return (
    <p className="flex items-center justify-center gap-(--space-2) text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
      <Icon name="loading-03" size="sm" aria-hidden="true" className="animate-spin" />
      {COPY.loadingMore}
    </p>
  );
}

/** The client's *Semua foto* grid: folders first, then photos at the same size, skeletons while loading and a sentinel for the next 48 (klien-3 exports, A-12, A-13, A-28). @param props - browse state and handlers @returns the grid */
export function ClientBrowseGrid({
  state,
  onOpenFolder,
  onOpenPhoto,
  onLoadMore,
}: Readonly<ClientBrowseGridProps>) {
  const hasMore = state.page?.nextCursor != null;
  const sentinel = useIntersectionSentinel(
    onLoadMore,
    hasMore && !state.isLoading && !state.isLoadingMore,
  );
  if (state.hasFailed) {
    return (
      <EmptyState
        icon="image-off"
        placement="in-card"
        title={COPY.unavailableTitle}
        body={COPY.unavailableBody}
      />
    );
  }
  const isEmpty = (state.page?.folders.length ?? 0) === 0 && state.photos.length === 0;
  if (!state.isLoading && state.page !== null && isEmpty) {
    return <Empty search={state.location.search} />;
  }
  return (
    <div
      aria-busy={state.isLoading || state.isLoadingMore}
      className="flex flex-col gap-(--space-5)"
    >
      <ul className={CLIENT_GRID}>
        <GridItems state={state} onOpenFolder={onOpenFolder} onOpenPhoto={onOpenPhoto} />
      </ul>
      {state.isLoadingMore ? <LoadingMore /> : null}
      <div ref={sentinel} aria-hidden="true" />
    </div>
  );
}
