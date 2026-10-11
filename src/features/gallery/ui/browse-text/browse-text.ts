import type { GalleryPhotoView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import type { GalleryStatus } from "@/features/gallery/domain/gallery-status/gallery-status.types";

import {
  GALLERY_KIND_LOWER_MESSAGE_KEY,
  GALLERY_VISIBILITY_FOLDED_MESSAGE_KEY,
  GALLERY_VISIBILITY_MESSAGE_KEY,
} from "../gallery-copy/gallery-copy.copy";
import type { GalleryTranslate } from "../gallery-copy/gallery-copy.types";
import type { BrowseLocation, Crumb } from "./browse-text.types";

/** Builds the breadcrumb *Semua folder › {source} › {folder}…*; the last crumb is current (A-12, AC-GAL-028, 030). @param location - where the modal is @param sourceName - the opened source's name @returns the crumbs */
export function browseCrumbs(
  t: GalleryTranslate,
  location: BrowseLocation,
  sourceName: string | null,
): Crumb[] {
  const root = { ...location, sourceId: null, path: "" };
  const crumbs: Crumb[] = [{ label: t("breadcrumbRoot"), target: root }];
  if (location.sourceId !== null) {
    crumbs.push({
      label: sourceName ?? t("sourceFallbackName"),
      target: { ...location, path: "" },
    });
    const segments = location.path === "" ? [] : location.path.split("/");
    segments.forEach((segment, index) => {
      crumbs.push({
        label: segment,
        target: { ...location, path: segments.slice(0, index + 1).join("/") },
      });
    });
  }
  return crumbs.map((crumb, index) =>
    index === crumbs.length - 1 ? { ...crumb, target: null } : crumb,
  );
}

/** The meta line of a search result tile: its folder and kind, e.g. *Rina-Wisuda › Akad · edited* (AC-GAL-029). @param photo - the photo @returns the meta */
export function searchMeta(t: GalleryTranslate, photo: GalleryPhotoView): string {
  const folders = [
    photo.sourceName ?? t("sourceFallbackName"),
    ...(photo.browsePath === "" ? [] : photo.browsePath.split("/")),
  ];
  return `${folders.join(" › ")} · ${t(GALLERY_KIND_LOWER_MESSAGE_KEY[photo.kind])}`;
}

/** The client-visibility line of a tab: proof follows the gallery status, edited and print are hidden until final delivery (BR-DEL-002, AC-GAL-014). @param kind - the tab @param status - effective gallery status @returns the line */
export function kindVisibility(
  t: GalleryTranslate,
  kind: BrowseLocation["kind"],
  status: GalleryStatus,
): string {
  return kind === "PROOF"
    ? t(GALLERY_VISIBILITY_MESSAGE_KEY[status])
    : t(GALLERY_VISIBILITY_FOLDED_MESSAGE_KEY[kind]);
}
