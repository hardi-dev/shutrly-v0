"use client";

import { Button as AriaButton } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { PHOTO_TILE_COPY } from "./photo-tile.copy";
import type { PhotoTileImageProps, PhotoTileProps } from "./photo-tile.types";

// C46: the image height is a literal per grid, 104 on phones and 220 on desktop (photo-tile.md › Gaps).
const IMAGE =
  "relative h-[104px] w-full overflow-hidden rounded-(--component-photo-tile-image-radius) bg-(--component-photo-tile-image-background) md:h-[220px]";
const NAME =
  "truncate text-(length:--font-size-body-sm) font-medium text-(--component-photo-tile-name)";
const META = "truncate text-(length:--font-size-caption) text-(--component-photo-tile-meta)";
const FOCUS =
  "outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-(--color-semantic-focus-ring)";

function PhotoTileImage({ imageSrc, isMissing }: Readonly<PhotoTileImageProps>) {
  return (
    <span className={IMAGE}>
      {/* A plain img on the Owner endpoint: next/image would cache it publicly (TD › UI Components). */}
      {/* eslint-disable-next-line @next/next/no-img-element -- the private media proxy must not go through the image optimiser */}
      <img
        src={imageSrc}
        alt=""
        loading="lazy"
        decoding="async"
        className="size-full object-cover"
      />
      {isMissing ? (
        <span className="absolute top-(--component-photo-tile-badge-inset) left-(--component-photo-tile-badge-inset)">
          <StatusChip tone="warning" label={PHOTO_TILE_COPY.missingBadge} hasDot />
        </span>
      ) : null}
    </span>
  );
}

/** One photo in a grid: thumbnail, file name and an optional meta line; a missing file shows *Hilang* (C46). @param props - file, image and press handler @returns the tile */
export function PhotoTile({
  fileName,
  meta,
  imageSrc,
  isMissing = false,
  onPress,
}: Readonly<PhotoTileProps>) {
  const content = (
    <>
      <PhotoTileImage imageSrc={imageSrc} isMissing={isMissing} />
      <span className="flex w-full min-w-0 flex-col gap-(--component-photo-tile-text-gap) text-left">
        <span className={NAME}>{fileName}</span>
        {meta ? <span className={META}>{meta}</span> : null}
      </span>
    </>
  );
  const label = isMissing ? `${fileName}, ${PHOTO_TILE_COPY.missingSuffix}` : fileName;
  if (!onPress) {
    return <div className="flex min-w-0 flex-col gap-(--component-photo-tile-gap)">{content}</div>;
  }
  return (
    <AriaButton
      aria-label={label}
      onPress={onPress}
      className={cn(
        "flex w-full min-w-0 cursor-pointer flex-col gap-(--component-photo-tile-gap) rounded-(--component-photo-tile-image-radius)",
        FOCUS,
      )}
    >
      {content}
    </AriaButton>
  );
}

/** The loading placeholder of a photo tile (C46 Skeleton), used while infinite scroll loads. @returns the skeleton */
export function PhotoTileSkeleton() {
  return (
    <div aria-hidden="true" className="flex min-w-0 flex-col gap-(--component-photo-tile-gap)">
      <span className={cn(IMAGE, "block")} />
      <span className="h-(--space-3) w-3/5 rounded-(--component-photo-tile-image-radius) bg-(--component-photo-tile-image-background)" />
    </div>
  );
}
