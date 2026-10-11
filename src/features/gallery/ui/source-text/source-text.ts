import type { GallerySourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import {
  formatGalleryDate,
  formatGalleryDateTime,
  formatGalleryShortDateTime,
  formatGalleryTime,
} from "@/features/gallery/domain/gallery-display/gallery-display";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import {
  GALLERY_SOURCE_CHIP_MESSAGE_KEY,
  GALLERY_SYNC_ERROR_MESSAGE_KEY,
} from "../gallery-copy/gallery-copy.copy";
import type { GalleryTranslate } from "../gallery-copy/gallery-copy.types";
import type {
  SourceRowMode,
  SourceRowText,
  SourceSyncPhase,
  SourceSyncProgress,
} from "./source-text.types";

function countsText(
  t: GalleryTranslate,
  source: GallerySourceView,
  withIgnored: boolean,
): string[] {
  const parts = [t("sourceProof", { count: source.proofCount })];
  if (source.missingCount > 0) parts.push(t("sourceMissing", { count: source.missingCount }));
  const finished = source.editedCount + source.printCount;
  if (finished > 0) parts.push(t("sourceFinished", { count: finished }));
  if (withIgnored && source.ignoredCount > 0)
    parts.push(t("sourceIgnored", { count: source.ignoredCount }));
  if (withIgnored && source.tooDeepCount > 0)
    parts.push(t("sourceTooDeep", { count: source.tooDeepCount }));
  return parts;
}

function syncedMeta(
  t: GalleryTranslate,
  source: GallerySourceView,
  mode: SourceRowMode,
  locale: FormattingLocale,
): string {
  const { lastSyncedAt } = source;
  if (lastSyncedAt === null) return [source.workspaceSourceName, t("sourceNever")].join(" · ");
  if (mode.isReadOnly) {
    const text = mode.isMobile
      ? t("sourceLastSyncedShort", { when: formatGalleryShortDateTime(lastSyncedAt, locale) })
      : t("sourceLastSyncedAt", { when: formatGalleryDateTime(lastSyncedAt, locale) });
    return mode.isMobile ? text : [source.workspaceSourceName, text].join(" · ");
  }
  if (mode.isMobile)
    return [...countsText(t, source, false), formatGalleryTime(lastSyncedAt, locale)].join(" · ");
  const synced = t("sourceSyncedAt", { when: formatGalleryDateTime(lastSyncedAt, locale) });
  return [source.workspaceSourceName, synced, ...countsText(t, source, true)].join(" · ");
}

function removedMeta(
  t: GalleryTranslate,
  source: GallerySourceView,
  locale: FormattingLocale,
): string {
  const photos = source.proofCount + source.editedCount + source.printCount;
  const when = source.removedAt === null ? "" : formatGalleryDate(source.removedAt, locale);
  return t("sourceRemovedAt", { when: when, photos: photos });
}

function runningText(
  t: GalleryTranslate,
  source: GallerySourceView,
  phase: SourceSyncPhase,
  progress: SourceSyncProgress,
): SourceRowText | null {
  const running = phase ?? (source.syncStatus === "SYNCING" ? "SYNCING" : null);
  if (running === null) return null;
  const meta = runningMeta(t, running, progress);
  return {
    title: source.name ?? t("sourceFallbackName"),
    meta: `${source.workspaceSourceName} · ${meta}`,
    metaTone: "default",
    chip: { tone: "info", label: t(GALLERY_SOURCE_CHIP_MESSAGE_KEY.SYNCING), hasDot: true },
  };
}

function runningMeta(
  t: GalleryTranslate,
  running: "QUEUED" | "SYNCING",
  progress: SourceSyncProgress,
): string {
  if (running === "QUEUED") return t("sourceQueued");
  return progress === null
    ? t("sourceSyncing")
    : t("sourceSyncProgress", { done: progress.foldersDone, total: progress.foldersTotal });
}

/** Builds a source row's title, meta and status chip from its sync state and the page mode (design.md › Sumber foto, AC-GAL-005, 007, 008, 013). @param source - the source view @param phase - the client's running sync, if any @param progress - how far that sync has come @param mode - archived, read-only and phone flags @returns the row text */
export function sourceRowText(
  t: GalleryTranslate,
  source: GallerySourceView,
  phase: SourceSyncPhase,
  progress: SourceSyncProgress,
  mode: SourceRowMode,
  locale: FormattingLocale,
): SourceRowText {
  const title = source.name ?? t("sourceFallbackName");
  const neutral = (label: string): SourceRowText["chip"] => ({
    tone: "neutral",
    label,
    hasDot: true,
  });
  if (source.removed) {
    return {
      title,
      meta: removedMeta(t, source, locale),
      metaTone: "default",
      chip: neutral(t(GALLERY_SOURCE_CHIP_MESSAGE_KEY.REMOVED)),
    };
  }
  if (mode.isArchived) {
    return {
      title,
      meta: syncedMeta(t, source, mode, locale),
      metaTone: "default",
      chip: neutral(t(GALLERY_SOURCE_CHIP_MESSAGE_KEY.ARCHIVED)),
    };
  }
  const running = runningText(t, source, phase, progress);
  if (running !== null) return running;
  if (source.syncStatus === "FAILED" && source.syncErrorCode !== null) {
    return {
      title,
      meta: t(GALLERY_SYNC_ERROR_MESSAGE_KEY[source.syncErrorCode]),
      metaTone: "danger",
      chip: { tone: "danger", label: t(GALLERY_SOURCE_CHIP_MESSAGE_KEY.FAILED), hasDot: true },
    };
  }
  const isDone = source.syncStatus === "SUCCEEDED";
  const label = t(GALLERY_SOURCE_CHIP_MESSAGE_KEY[isDone ? "SUCCEEDED" : "NEVER"]);
  return {
    title,
    meta: syncedMeta(t, source, mode, locale),
    metaTone: "default",
    chip: { tone: isDone ? "success" : "neutral", label, hasDot: true },
  };
}
