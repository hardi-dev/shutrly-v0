"use client";

import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { GalleryRowMenu } from "../gallery-row-menu/gallery-row-menu";
import { sourceRowText } from "../source-text/source-text";
import type { GallerySourceRowProps } from "./gallery-source-row.types";

/** One linked folder: name, sync summary or failure reason, status chip and its ⋯ menu (design.md › Sumber foto). */
export function GallerySourceRow({
  source,
  phase,
  isArchived,
  menuEntries,
  isLast,
}: Readonly<GallerySourceRowProps>) {
  const text = sourceRowText(source, phase, isArchived);
  return (
    <ListCardItem
      icon="folder"
      title={text.title}
      meta={text.meta}
      metaTone={text.metaTone}
      isLast={isLast}
      trailing={
        <>
          <StatusChip {...text.chip} />
          {menuEntries.length > 0 ? (
            <GalleryRowMenu
              label={GALLERY_COPY.sourceMenu(text.title)}
              title={text.title}
              entries={menuEntries}
            />
          ) : null}
        </>
      }
    />
  );
}
