"use client";

import { useIntersectionSentinel } from "@/ui/hooks/use-intersection-sentinel/use-intersection-sentinel";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { PhotoTile } from "@/ui/patterns/photo-tile/photo-tile";
import type { PhotoTileBadge, PhotoTileNote } from "@/ui/patterns/photo-tile/photo-tile.types";

import { CLIENT_GRID } from "../client-browse-grid/client-browse-grid";
import { CLIENT_BROWSE_COPY } from "../client-browse-screen/client-browse-screen.copy";
import { PICK_COPY as COPY } from "./pick-screen.copy";
import type { PickGridProps, PickTileProps } from "./pick-screen.types";
import { otherGroupMarker } from "./pick-text";

function badgeOf({ pick, others, group }: Readonly<PickTileProps>): PhotoTileBadge | undefined {
  if (pick && group.mode === "QUANTITY")
    return { label: COPY.quantity(pick.quantity), tone: "info" };
  const marker = otherGroupMarker(others);
  return marker === null ? undefined : { label: marker, tone: "neutral" };
}

function PickTile(props: Readonly<PickTileProps>) {
  const { photo, pick, group, isFull, onToggle, onNote } = props;
  const handleChange = (isSelected: boolean) => {
    onToggle(photo, isSelected);
  };
  const handleNote = () => {
    onNote(photo.id);
  };
  // A-32: picked tiles of a group with notes carry the *Catatan* button.
  const note: PhotoTileNote | undefined =
    pick && group.allowsPickNotes
      ? {
          hasNote: pick.note !== null,
          label: COPY.note,
          accessibleLabel:
            pick.note === null ? COPY.noteAdd(photo.fileName) : COPY.noteEdit(photo.fileName),
          onPress: handleNote,
        }
      : undefined;
  return (
    <li className="min-w-0">
      <PhotoTile
        fileName={photo.fileName}
        imageSrc={photo.thumb.src}
        fallbackSrc={photo.thumb.fallbackSrc}
        isMissing={photo.missing}
        selection={{ isSelected: pick !== undefined, isDisabled: isFull, onChange: handleChange }}
        badge={badgeOf(props)}
        note={note}
      />
    </li>
  );
}

/** Pilih's grid: every proof (paged, infinite scroll) or only this group's picks, each tile toggling a pick (pilih exports, A-25, A-28). @param props - filter, selection, grid paging and the note handler @returns the grid */
export function PickGrid({ filter, selection, grid, onNote }: Readonly<PickGridProps>) {
  const isAll = filter === "ALL";
  const loadMore = () => {
    void grid.loadMore();
  };
  const sentinel = useIntersectionSentinel(
    loadMore,
    isAll && grid.state.nextCursor !== null && !grid.state.isLoadingMore,
  );
  const { state } = selection;
  const photos = isAll ? grid.state.photos : Array.from(state.picks.values(), (pick) => pick.photo);
  if (photos.length === 0) {
    return isAll ? (
      <EmptyState
        icon="images"
        placement="in-card"
        title={CLIENT_BROWSE_COPY.emptyTitle}
        body={CLIENT_BROWSE_COPY.emptyBody}
      />
    ) : (
      <EmptyState
        icon="images"
        placement="in-card"
        title={COPY.pickedEmptyTitle}
        body={COPY.pickedEmptyBody}
      />
    );
  }
  return (
    <div aria-busy={grid.state.isLoadingMore} className="flex flex-col gap-(--space-5)">
      <ul className={CLIENT_GRID}>
        {photos.map((photo) => (
          <PickTile
            key={photo.id}
            photo={photo}
            pick={state.picks.get(photo.id)}
            others={state.otherPicks.get(photo.id) ?? []}
            group={state.group}
            isFull={selection.isFull}
            onToggle={selection.toggle}
            onNote={onNote}
          />
        ))}
      </ul>
      {isAll ? <div ref={sentinel} aria-hidden="true" /> : null}
    </div>
  );
}
