"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { GallerySourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { GALLERY_REFUSED_MESSAGE_KEY } from "../gallery-copy/gallery-copy.copy";
import type { GalleryTranslate } from "../gallery-copy/gallery-copy.types";
import type { SourceSyncPhase, SourceSyncProgress } from "../source-text/source-text.types";
import { USE_GALLERY_SYNC_COPY_NAMESPACE } from "./use-gallery-sync.copy";
import type {
  GallerySyncState,
  SyncReport,
  SyncRunOutcome,
  SyncTarget,
  UseGallerySyncInput,
} from "./use-gallery-sync.types";

// TD D-9: a run is a loop of server steps; this stops a loop that never ends.
export const GALLERY_SYNC_MAX_STEPS = 500;

function report(outcomes: readonly [SyncTarget, SyncRunOutcome][]): SyncReport {
  const failedNames = outcomes
    .filter(([, outcome]) => !outcome.ok || outcome.status === "FAILED")
    .map(([target]) => target.name);
  return { synced: outcomes.length - failedNames.length, failedNames };
}

function toastFor(t: GalleryTranslate, outcomes: readonly [SyncTarget, SyncRunOutcome][]): void {
  const single = outcomes.length === 1 ? outcomes[0][1] : null;
  if (single && !single.ok) {
    showToast({ tone: "danger", title: t(GALLERY_REFUSED_MESSAGE_KEY[single.code]) });
    return;
  }
  const { synced, failedNames } = report(outcomes);
  if (synced === 0) {
    showToast({
      tone: "danger",
      title: t("syncFailedTitle"),
      body: t("syncFailedBody"),
    });
    return;
  }
  const failed =
    failedNames.length === 0 ? "" : ` ${t("syncFailedNames", { names: failedNames.join(", ") })}`;
  showToast({
    tone: "success",
    title: t("syncDoneTitle"),
    body: `${t("syncDoneBody", { count: synced })}${failed}`,
  });
}

/** F-21: names the subfolders a sync found for the first time, with *Petakan* to open the mapping. */
function newFoldersToast(
  t: GalleryTranslate,
  outcomes: readonly [SyncTarget, SyncRunOutcome][],
  onMapFolders: UseGallerySyncInput["onMapFolders"],
): void {
  for (const [target, outcome] of outcomes) {
    if (!outcome.ok || outcome.status !== "SUCCEEDED") continue;
    const folders = outcome.newFolders ?? [];
    if (folders.length === 0) continue;
    showToast({
      tone: "info",
      title: t("newFoldersTitle", { count: folders.length, source: target.name }),
      body: t("newFoldersBody", { folders: folders.join(", ") }),
      action: onMapFolders
        ? {
            label: t("mapFolders"),
            onAction: () => {
              onMapFolders(target.id);
            },
          }
        : undefined,
    });
  }
}

function toTarget(t: GalleryTranslate, source: GallerySourceView): SyncTarget {
  return { id: source.id, name: source.name ?? t("sourceFallbackName") };
}

const FAILED_RUN: SyncRunOutcome = { ok: true, status: "FAILED", errorCode: "UNAVAILABLE" };

async function runSteps(
  input: Readonly<UseGallerySyncInput>,
  target: SyncTarget,
  onProgress: (next: SourceSyncProgress) => void,
): Promise<SyncRunOutcome> {
  for (let step = 0; step < GALLERY_SYNC_MAX_STEPS; step += 1) {
    const outcome = await input.syncSourceAction(input.workspaceId, target.id);
    if (!outcome.ok || outcome.status !== "CONTINUE") return outcome;
    onProgress(outcome);
  }
  return FAILED_RUN;
}

function useSyncMarks() {
  const [phases, setPhases] = useState<ReadonlyMap<string, SourceSyncPhase>>(new Map());
  const [progress, setProgress] = useState<ReadonlyMap<string, SourceSyncProgress>>(new Map());
  const setPhase = (ids: readonly string[], phase: SourceSyncPhase) => {
    setPhases(
      (current) =>
        new Map([...current, ...ids.map((id): [string, SourceSyncPhase] => [id, phase])]),
    );
  };
  const setStepProgress = (id: string, next: SourceSyncProgress) => {
    setProgress((current) => new Map([...current, [id, next]]));
  };
  return { phases, progress, setPhase, setStepProgress };
}

/** Runs *Sinkronkan* for one source, *Sinkronkan semua* one source at a time, and the first sync of a newly linked folder, each as a loop of server steps with its own progress (D-9, D-27, AC-GAL-012, AC-GAL-032). @param input - workspace and the sync step action @returns the phases, the progress and the triggers */
export function useGallerySync(input: Readonly<UseGallerySyncInput>): GallerySyncState {
  const t = useTranslations(USE_GALLERY_SYNC_COPY_NAMESPACE);
  const router = useRouter();
  const { phases, progress, setPhase, setStepProgress } = useSyncMarks();
  const runOne = async (target: SyncTarget): Promise<[SyncTarget, SyncRunOutcome]> => {
    setPhase([target.id], "SYNCING");
    const outcome = await runSteps(input, target, (next) => {
      setStepProgress(target.id, next);
    }).catch((): SyncRunOutcome => FAILED_RUN);
    setPhase([target.id], null);
    setStepProgress(target.id, null);
    return [target, outcome];
  };
  const run = async (targets: readonly SyncTarget[]) => {
    setPhase(
      targets.map((target) => target.id),
      "QUEUED",
    );
    const outcomes: [SyncTarget, SyncRunOutcome][] = [];
    for (const target of targets) outcomes.push(await runOne(target));
    toastFor(t, outcomes);
    newFoldersToast(t, outcomes, input.onMapFolders);
    router.refresh();
  };
  return {
    phaseOf: (sourceId) => phases.get(sourceId) ?? null,
    progressOf: (sourceId) => progress.get(sourceId) ?? null,
    isRunning: [...phases.values()].some((phase) => phase !== null),
    syncOne: (source) => void run([toTarget(t, source)]),
    syncAll: (sources) => void run(sources.map((source) => toTarget(t, source))),
    syncNew: (sourceId) => void run([{ id: sourceId, name: t("sourceFallbackName") }]),
  };
}
