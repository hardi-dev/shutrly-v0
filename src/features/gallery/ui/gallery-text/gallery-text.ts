import type { GalleryPhotoCounts } from "@/features/gallery/application/ports/gallery-repository/gallery-repository.port";
import { formatGalleryDate } from "@/features/gallery/domain/gallery-display/gallery-display";
import type { GalleryState } from "@/features/gallery/domain/gallery-state/gallery-state.types";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import type { StatusChipProps } from "@/ui/primitives/status-chip/status-chip.types";

import {
  GALLERY_STATUS_MESSAGE_KEY,
  GALLERY_VISIBILITY_MESSAGE_KEY,
} from "../gallery-copy/gallery-copy.copy";
import type { GalleryTranslate } from "../gallery-copy/gallery-copy.types";
import type { ExpiryFact, ExpiryFacts, MetaFacts } from "./gallery-text.types";

const STATE_TONE: Readonly<Record<GalleryState, StatusChipProps["tone"]>> = {
  OPEN: "success",
  EXPIRED: "warning",
  CLOSED: "neutral",
};

/** Builds the Status Chip props for a gallery state (design.md › Layout). @param state - derived gallery state @returns tone, label and dot */
export function galleryStatusChip(
  t: GalleryTranslate,
  state: GalleryState,
): Pick<StatusChipProps, "tone" | "label" | "hasDot"> {
  return { tone: STATE_TONE[state], label: t(GALLERY_STATUS_MESSAGE_KEY[state]), hasDot: true };
}

/** Describes the expiry for the facts rows: none, a draft duration, or the day. @param gallery - expiry facts @returns the display value and whether it is muted */
export function galleryExpiryFact(
  t: GalleryTranslate,
  gallery: ExpiryFacts,
  locale: FormattingLocale,
): ExpiryFact {
  if (gallery.expiresAt !== null) {
    const date = formatGalleryDate(gallery.expiresAt, locale);
    return {
      text: gallery.state === "EXPIRED" ? t("expiryPast", { date: date }) : date,
      isMuted: false,
    };
  }
  if (gallery.expiryDays !== null)
    return { text: t("expiryDays", { count: gallery.expiryDays }), isMuted: false };
  return { text: t("expiryNone"), isMuted: true };
}

/** Formats the proof and finished counts with the missing count after proof (AC-GAL-014, F-21). @param counts - photo counts @returns e.g. "8 proof (1 hilang) · 3 hasil akhir" */
export function photoCountsText(t: GalleryTranslate, counts: GalleryPhotoCounts): string {
  const finished = counts.edited + counts.print;
  if (counts.missing > 0) {
    return t("photoCountsMissing", { proof: counts.proof, missing: counts.missing, finished });
  }
  return t("photoCounts", { proof: counts.proof, finished });
}

function expiryMeta(
  t: GalleryTranslate,
  gallery: ExpiryFacts,
  locale: FormattingLocale,
): string | null {
  if (gallery.state === "CLOSED") return null;
  if (gallery.expiresAt === null) {
    return gallery.expiryDays === null
      ? t("expiryNoneMeta")
      : t("expiryDays", { count: gallery.expiryDays });
  }
  const date = formatGalleryDate(gallery.expiresAt, locale);
  return gallery.state === "EXPIRED"
    ? t("expiredSince", { date: date })
    : t("expiryOn", { date: date });
}

/** Builds the page header meta line: folders, proof count and expiry (design.md › Layout). @param gallery - the summary @param projectTitle - prefix on desktop, or null on phones @returns the meta line */
export function galleryMetaText(
  t: GalleryTranslate,
  gallery: MetaFacts,
  projectTitle: string | null,
  locale: FormattingLocale,
): string {
  const parts = projectTitle === null ? [] : [projectTitle];
  if (gallery.activeSourceCount === 0) parts.push(t("noSources"));
  else
    parts.push(
      t("sourceCount", { count: gallery.activeSourceCount }),
      t("proofCount", { count: gallery.counts.proof }),
    );
  const expiry = expiryMeta(t, gallery, locale);
  if (expiry !== null) parts.push(expiry);
  return parts.join(" · ");
}

/** The client-visibility line of the *Foto* card, by the derived gallery state (design.md › Copy, AC-GAL-014). @param state - derived gallery state @returns the line */
export function galleryVisibilityText(t: GalleryTranslate, state: GalleryState): string {
  return t(GALLERY_VISIBILITY_MESSAGE_KEY[state]);
}
