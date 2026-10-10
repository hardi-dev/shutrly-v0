import type { GalleryPhotoCounts } from "@/features/gallery/application/ports/gallery-repository/gallery-repository.port";
import { formatGalleryDate } from "@/features/gallery/domain/gallery-display/gallery-display";
import type {
  GalleryProjectStatus,
  GalleryStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status.types";
import type { FormattingLocale } from "@/shared/locale/locale.types";
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
export function galleryExpiryFact(gallery: ExpiryFacts, locale: FormattingLocale): ExpiryFact {
  if (gallery.expiresAt !== null) {
    const date = formatGalleryDate(gallery.expiresAt, locale);
    return {
      text: gallery.status === "EXPIRED" ? GALLERY_COPY.expiryPast(date) : date,
      isMuted: false,
    };
  }
  if (gallery.expiryDays !== null)
    return { text: GALLERY_COPY.expiryDays(gallery.expiryDays), isMuted: false };
  return { text: GALLERY_COPY.expiryNone, isMuted: true };
}

/** Formats the proof and finished counts with the missing count after proof (AC-GAL-014, F-21). @param counts - photo counts @returns e.g. "8 proof (1 hilang) · 3 hasil akhir" */
export function photoCountsText(counts: GalleryPhotoCounts): string {
  const missing = counts.missing > 0 ? GALLERY_COPY.missingSuffix(counts.missing) : "";
  return GALLERY_COPY.photoCounts(counts.proof, counts.edited + counts.print).replace(
    " proof",
    ` proof${missing}`,
  );
}

function expiryMeta(gallery: ExpiryFacts, locale: FormattingLocale): string | null {
  if (gallery.status === "ARCHIVED") return null;
  if (gallery.expiresAt === null) {
    return gallery.expiryDays === null
      ? GALLERY_COPY.expiryNoneMeta
      : GALLERY_COPY.expiryDays(gallery.expiryDays);
  }
  const date = formatGalleryDate(gallery.expiresAt, locale);
  return gallery.status === "EXPIRED"
    ? GALLERY_COPY.expiredSince(date)
    : GALLERY_COPY.expiryOn(date);
}

/** Builds the page header meta line: folders, proof count and expiry (design.md › Layout). @param gallery - the summary @param projectTitle - prefix on desktop, or null on phones @returns the meta line */
export function galleryMetaText(
  gallery: MetaFacts,
  projectTitle: string | null,
  locale: FormattingLocale,
): string {
  const parts = projectTitle === null ? [] : [projectTitle];
  if (gallery.activeSourceCount === 0) parts.push(GALLERY_COPY.noSources);
  else
    parts.push(
      GALLERY_COPY.sourceCount(gallery.activeSourceCount),
      GALLERY_COPY.proofCount(gallery.counts.proof),
    );
  const expiry = expiryMeta(gallery, locale);
  if (expiry !== null) parts.push(expiry);
  return parts.join(" · ");
}

/** The client-visibility line of the *Foto* card: by gallery status, and for a draft on a cancelled project, which will never be visible (design.md › Copy, AC-GAL-014, AC-GAL-024). @param status - effective gallery status @param projectStatus - the project status @returns the line */
export function galleryVisibilityText(
  status: GalleryStatus,
  projectStatus: GalleryProjectStatus,
): string {
  if (projectStatus === "CANCELLED" && status === "DRAFT") return GALLERY_COPY.visibilityCancelled;
  return GALLERY_COPY.visibility[status];
}
