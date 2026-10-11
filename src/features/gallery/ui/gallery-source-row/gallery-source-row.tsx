"use client";

import { useTranslations } from "next-intl";

import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { GalleryRowMenu } from "../gallery-row-menu/gallery-row-menu";
import { sourceRowText } from "../source-text/source-text";
import { GALLERY_SOURCE_ROW_COPY_NAMESPACE } from "./gallery-source-row.copy";
import type { GallerySourceRowProps } from "./gallery-source-row.types";

/** One linked folder: name, sync summary or failure reason, status chip and its ⋯ menu (design.md › Sumber foto). */
export function GallerySourceRow({
  source,
  phase,
  progress,
  isArchived,
  isReadOnly,
  menuEntries,
  isLast,
}: Readonly<GallerySourceRowProps>) {
  const t = useTranslations(GALLERY_SOURCE_ROW_COPY_NAMESPACE);
  const locale = useFormattingLocale();
  const isMobile = useMobileViewport();
  const text = sourceRowText(
    t,
    source,
    phase,
    progress,
    { isArchived, isReadOnly, isMobile },
    locale,
  );
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
              label={t("sourceMenu", { name: text.title })}
              title={text.title}
              entries={menuEntries}
            />
          ) : null}
        </>
      }
    />
  );
}
