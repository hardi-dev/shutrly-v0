import type { GalleryPhotoCounts } from "@/features/gallery/application/ports/gallery-repository/gallery-repository.port";
import { formatGalleryDate } from "@/features/gallery/domain/gallery-display/gallery-display";
import type { GalleryStatus } from "@/features/gallery/domain/gallery-status/gallery-status.types";
import type { StatusChipProps } from "@/ui/primitives/status-chip/status-chip.types";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { ExpiryFact, ExpiryFacts, MetaFacts } from "./gallery-text.types";

const STATUS_TONE: Readonly<Record<GalleryStatus, StatusChipProps["tone"]>> = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  EXPIRED: "warning",
  ARCHIVED: "neutral",
};

/** Builds the Status Chip props for a gallery status (design.md › Layout). @param status - effective status @returns tone, label and dot */
export function galleryStatusChip(
  status: GalleryStatus,
): Pick<StatusChipProps, "tone" | "label" | "hasDot"> {
  return { tone: STATUS_TONE[status], label: GALLERY_COPY.status[status], hasDot: true };
}

/** Describes the expiry for the facts rows: none, a draft duration, or the day. @param gallery - expiry facts @returns the display value and whether it is muted */
export function galleryExpiryFact(gallery: ExpiryFacts): ExpiryFact {
  if (gallery.expiresAt !== null)
    return { text: formatGalleryDate(gallery.expiresAt), isMuted: false };
  if (gallery.expiryDays !== null)
    return { text: GALLERY_COPY.expiryDays(gallery.expiryDays), isMuted: false };
  return { text: GALLERY_COPY.expiryNone, isMuted: true };
}

/** Formats the per-kind counts with the missing count after proof, as drawn (AC-GAL-014). @param counts - photo counts @returns e.g. "8 proof (1 hilang) · 2 edited · 1 print" */
export function photoCountsText(counts: GalleryPhotoCounts): string {
  const missing = counts.missing > 0 ? GALLERY_COPY.missingSuffix(counts.missing) : "";
  return GALLERY_COPY.photoCounts(counts.proof, counts.edited, counts.print).replace(
    " proof",
    ` proof${missing}`,
  );
}

function expiryMeta(gallery: ExpiryFacts): string | null {
  if (gallery.status === "ARCHIVED") return null;
  if (gallery.expiresAt === null) {
    return gallery.expiryDays === null
      ? GALLERY_COPY.expiryNoneMeta
      : GALLERY_COPY.expiryDays(gallery.expiryDays);
  }
  const date = formatGalleryDate(gallery.expiresAt);
  return gallery.status === "EXPIRED"
    ? GALLERY_COPY.expiredSince(date)
    : GALLERY_COPY.expiryOn(date);
}

/** Builds the page header meta line: folders, proof count and expiry (design.md › Layout). @param gallery - the summary @param projectTitle - prefix on desktop, or null on phones @returns the meta line */
export function galleryMetaText(gallery: MetaFacts, projectTitle: string | null): string {
  const parts = projectTitle === null ? [] : [projectTitle];
  if (gallery.activeSourceCount === 0) parts.push(GALLERY_COPY.noSources);
  else
    parts.push(
      GALLERY_COPY.sourceCount(gallery.activeSourceCount),
      GALLERY_COPY.proofCount(gallery.counts.proof),
    );
  const expiry = expiryMeta(gallery);
  if (expiry !== null) parts.push(expiry);
  return parts.join(" · ");
}
