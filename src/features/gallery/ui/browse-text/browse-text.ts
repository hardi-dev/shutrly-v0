import type { GalleryPhotoView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import type { GalleryStatus } from "@/features/gallery/domain/gallery-status/gallery-status.types";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { BrowseLocation, Crumb } from "./browse-text.types";

/** Builds the breadcrumb *Semua folder › {source} › {folder}…*; the last crumb is current (A-12, AC-GAL-028, 030). @param location - where the modal is @param sourceName - the opened source's name @returns the crumbs */
export function browseCrumbs(location: BrowseLocation, sourceName: string | null): Crumb[] {
  const root = { ...location, sourceId: null, path: "" };
  const crumbs: Crumb[] = [{ label: GALLERY_COPY.breadcrumbRoot, target: root }];
  if (location.sourceId !== null) {
    crumbs.push({
      label: sourceName ?? GALLERY_COPY.sourceFallbackName,
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
export function searchMeta(photo: GalleryPhotoView): string {
  const folders = [
    photo.sourceName ?? GALLERY_COPY.sourceFallbackName,
    ...(photo.browsePath === "" ? [] : photo.browsePath.split("/")),
  ];
  return `${folders.join(" › ")} · ${GALLERY_COPY.kindLower[photo.kind]}`;
}

/** The client-visibility line of a tab: proof follows the gallery status, edited and print are hidden until final delivery (BR-DEL-002, AC-GAL-014). @param kind - the tab @param status - effective gallery status @returns the line */
export function kindVisibility(kind: BrowseLocation["kind"], status: GalleryStatus): string {
  return kind === "PROOF" ? GALLERY_COPY.visibility[status] : GALLERY_COPY.visibilityFolded[kind];
}
