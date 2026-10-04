import type { GallerySourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import { formatGalleryDateTime } from "@/features/gallery/domain/gallery-display/gallery-display";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { SourceRowText, SourceSyncPhase } from "./source-text.types";

const COPY = GALLERY_COPY;

function countsText(source: GallerySourceView): string[] {
  const parts = [COPY.sourceProof(source.proofCount)];
  if (source.missingCount > 0) parts.push(COPY.sourceMissing(source.missingCount));
  parts.push(COPY.sourceEdited(source.editedCount), COPY.sourcePrint(source.printCount));
  if (source.ignoredCount > 0) parts.push(COPY.sourceIgnored(source.ignoredCount));
  if (source.tooDeepCount > 0) parts.push(COPY.sourceTooDeep(source.tooDeepCount));
  return parts;
}

function syncedMeta(source: GallerySourceView, isArchived: boolean): string {
  if (source.lastSyncedAt === null)
    return [source.workspaceSourceName, COPY.sourceNever].join(" · ");
  const when = formatGalleryDateTime(source.lastSyncedAt);
  const synced = isArchived ? COPY.sourceLastSyncedAt(when) : COPY.sourceSyncedAt(when);
  return [source.workspaceSourceName, synced, ...(isArchived ? [] : countsText(source))].join(
    " · ",
  );
}

function runningText(source: GallerySourceView, phase: SourceSyncPhase): SourceRowText | null {
  const running = phase ?? (source.syncStatus === "SYNCING" ? "SYNCING" : null);
  if (running === null) return null;
  const meta = running === "QUEUED" ? COPY.sourceQueued : COPY.sourceSyncing;
  return {
    title: source.name ?? COPY.sourceFallbackName,
    meta: `${source.workspaceSourceName} · ${meta}`,
    metaTone: "default",
    chip: { tone: "info", label: COPY.sourceChip.SYNCING, hasDot: true },
  };
}

/** Builds a source row's title, meta and status chip from its sync state (design.md › Sumber foto, AC-GAL-005, 007, 008). @param source - the source view @param phase - the client's running sync, if any @param isArchived - the gallery is archived @returns the row text */
export function sourceRowText(
  source: GallerySourceView,
  phase: SourceSyncPhase,
  isArchived: boolean,
): SourceRowText {
  const title = source.name ?? COPY.sourceFallbackName;
  if (source.removed) {
    return {
      title,
      meta: syncedMeta(source, true),
      metaTone: "default",
      chip: { tone: "neutral", label: COPY.sourceChip.REMOVED, hasDot: true },
    };
  }
  if (isArchived) {
    return {
      title,
      meta: syncedMeta(source, true),
      metaTone: "default",
      chip: { tone: "neutral", label: COPY.sourceChip.ARCHIVED, hasDot: true },
    };
  }
  const running = runningText(source, phase);
  if (running !== null) return running;
  if (source.syncStatus === "FAILED" && source.syncErrorCode !== null) {
    return {
      title,
      meta: COPY.syncError[source.syncErrorCode],
      metaTone: "danger",
      chip: { tone: "danger", label: COPY.sourceChip.FAILED, hasDot: true },
    };
  }
  const tone = source.syncStatus === "SUCCEEDED" ? "success" : "neutral";
  const label =
    source.syncStatus === "SUCCEEDED" ? COPY.sourceChip.SUCCEEDED : COPY.sourceChip.NEVER;
  return {
    title,
    meta: syncedMeta(source, false),
    metaTone: "default",
    chip: { tone, label, hasDot: true },
  };
}
