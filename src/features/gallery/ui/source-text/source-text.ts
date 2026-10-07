import type { GallerySourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import {
  formatGalleryDate,
  formatGalleryDateTime,
  formatGalleryShortDateTime,
  formatGalleryTime,
} from "@/features/gallery/domain/gallery-display/gallery-display";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type {
  SourceRowMode,
  SourceRowText,
  SourceSyncPhase,
  SourceSyncProgress,
} from "./source-text.types";

const COPY = GALLERY_COPY;

function countsText(source: GallerySourceView, withIgnored: boolean): string[] {
  const parts = [COPY.sourceProof(source.proofCount)];
  if (source.missingCount > 0) parts.push(COPY.sourceMissing(source.missingCount));
  const finished = source.editedCount + source.printCount;
  if (finished > 0) parts.push(COPY.sourceFinished(finished));
  if (withIgnored && source.ignoredCount > 0) parts.push(COPY.sourceIgnored(source.ignoredCount));
  if (withIgnored && source.tooDeepCount > 0) parts.push(COPY.sourceTooDeep(source.tooDeepCount));
  return parts;
}

function syncedMeta(source: GallerySourceView, mode: SourceRowMode): string {
  const { lastSyncedAt } = source;
  if (lastSyncedAt === null) return [source.workspaceSourceName, COPY.sourceNever].join(" · ");
  if (mode.isReadOnly) {
    const text = mode.isMobile
      ? COPY.sourceLastSyncedShort(formatGalleryShortDateTime(lastSyncedAt))
      : COPY.sourceLastSyncedAt(formatGalleryDateTime(lastSyncedAt));
    return mode.isMobile ? text : [source.workspaceSourceName, text].join(" · ");
  }
  if (mode.isMobile)
    return [...countsText(source, false), formatGalleryTime(lastSyncedAt)].join(" · ");
  const synced = COPY.sourceSyncedAt(formatGalleryDateTime(lastSyncedAt));
  return [source.workspaceSourceName, synced, ...countsText(source, true)].join(" · ");
}

function removedMeta(source: GallerySourceView): string {
  const photos = source.proofCount + source.editedCount + source.printCount;
  const when = source.removedAt === null ? "" : formatGalleryDate(source.removedAt);
  return COPY.sourceRemovedAt(when, photos);
}

function runningText(
  source: GallerySourceView,
  phase: SourceSyncPhase,
  progress: SourceSyncProgress,
): SourceRowText | null {
  const running = phase ?? (source.syncStatus === "SYNCING" ? "SYNCING" : null);
  if (running === null) return null;
  const meta = runningMeta(running, progress);
  return {
    title: source.name ?? COPY.sourceFallbackName,
    meta: `${source.workspaceSourceName} · ${meta}`,
    metaTone: "default",
    chip: { tone: "info", label: COPY.sourceChip.SYNCING, hasDot: true },
  };
}

function runningMeta(running: "QUEUED" | "SYNCING", progress: SourceSyncProgress): string {
  if (running === "QUEUED") return COPY.sourceQueued;
  return progress === null
    ? COPY.sourceSyncing
    : COPY.sourceSyncProgress(progress.foldersDone, progress.foldersTotal);
}

/** Builds a source row's title, meta and status chip from its sync state and the page mode (design.md › Sumber foto, AC-GAL-005, 007, 008, 013). @param source - the source view @param phase - the client's running sync, if any @param progress - how far that sync has come @param mode - archived, read-only and phone flags @returns the row text */
export function sourceRowText(
  source: GallerySourceView,
  phase: SourceSyncPhase,
  progress: SourceSyncProgress,
  mode: SourceRowMode,
): SourceRowText {
  const title = source.name ?? COPY.sourceFallbackName;
  const neutral = (label: string): SourceRowText["chip"] => ({
    tone: "neutral",
    label,
    hasDot: true,
  });
  if (source.removed) {
    return {
      title,
      meta: removedMeta(source),
      metaTone: "default",
      chip: neutral(COPY.sourceChip.REMOVED),
    };
  }
  if (mode.isArchived) {
    return {
      title,
      meta: syncedMeta(source, mode),
      metaTone: "default",
      chip: neutral(COPY.sourceChip.ARCHIVED),
    };
  }
  const running = runningText(source, phase, progress);
  if (running !== null) return running;
  if (source.syncStatus === "FAILED" && source.syncErrorCode !== null) {
    return {
      title,
      meta: COPY.syncError[source.syncErrorCode],
      metaTone: "danger",
      chip: { tone: "danger", label: COPY.sourceChip.FAILED, hasDot: true },
    };
  }
  const isDone = source.syncStatus === "SUCCEEDED";
  const label = isDone ? COPY.sourceChip.SUCCEEDED : COPY.sourceChip.NEVER;
  return {
    title,
    meta: syncedMeta(source, mode),
    metaTone: "default",
    chip: { tone: isDone ? "success" : "neutral", label, hasDot: true },
  };
}
