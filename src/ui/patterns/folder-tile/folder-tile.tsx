"use client";

import { Button as AriaButton } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";

import { FOLDER_TILE_COPY } from "./folder-tile.copy";
import type { FolderTileProps } from "./folder-tile.types";

// C47: the same footprint as a Photo Tile; the wrap height is a literal per grid (folder-tile.md › Gaps).
const WRAP =
  "flex h-[104px] w-full items-center justify-center rounded-(--component-folder-tile-radius) border border-(--component-folder-tile-border) bg-(--component-folder-tile-background) text-(--component-folder-tile-icon) md:h-[220px]";
const FOCUS =
  "outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-(--color-semantic-focus-ring)";

/** A folder in the photo grid: icon, name and photo count; one button that opens it (C47). @param props - name, count label and press handler @returns the tile */
export function FolderTile({ name, countLabel, onPress }: Readonly<FolderTileProps>) {
  return (
    <AriaButton
      aria-label={FOLDER_TILE_COPY.label(name, countLabel)}
      onPress={onPress}
      className={cn(
        "flex min-w-0 cursor-pointer flex-col gap-(--component-folder-tile-gap) rounded-(--component-folder-tile-radius) text-left",
        FOCUS,
      )}
    >
      <span className={WRAP}>
        <Icon name="folder" aria-hidden="true" className="size-(--space-8) md:size-(--space-12)" />
      </span>
      <span className="flex w-full min-w-0 flex-col gap-(--component-folder-tile-text-gap)">
        <span className="truncate text-(length:--font-size-body-sm) font-medium text-(--component-folder-tile-name)">
          {name}
        </span>
        <span className="truncate text-(length:--font-size-caption) text-(--component-folder-tile-count)">
          {countLabel}
        </span>
      </span>
    </AriaButton>
  );
}
