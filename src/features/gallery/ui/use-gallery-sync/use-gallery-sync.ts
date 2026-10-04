"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { GallerySourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { SourceSyncPhase, SourceSyncProgress } from "../source-text/source-text.types";
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

function toastFor(outcomes: readonly [SyncTarget, SyncRunOutcome][]): void {
  const single = outcomes.length === 1 ? outcomes[0][1] : null;
  if (single && !single.ok) {
    showToast({ tone: "danger", title: GALLERY_COPY.refused[single.code] });
    return;
  }
  const { synced, failedNames } = report(outcomes);
  if (synced === 0) {
    showToast({
      tone: "danger",
      title: GALLERY_COPY.syncFailedTitle,
      body: GALLERY_COPY.syncFailedBody,
    });
    return;
  }
  const failed =
    failedNames.length === 0 ? "" : ` ${GALLERY_COPY.syncFailedNames(failedNames.join(", "))}`;
  showToast({
    tone: "success",
    title: GALLERY_COPY.syncDoneTitle,
    body: `${GALLERY_COPY.syncDoneBody(synced)}${failed}`,
  });
}

function toTarget(source: GallerySourceView): SyncTarget {
  return { id: source.id, name: source.name ?? GALLERY_COPY.sourceFallbackName };
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
    toastFor(outcomes);
    router.refresh();
  };
  return {
    phaseOf: (sourceId) => phases.get(sourceId) ?? null,
    progressOf: (sourceId) => progress.get(sourceId) ?? null,
    isRunning: [...phases.values()].some((phase) => phase !== null),
    syncOne: (source) => void run([toTarget(source)]),
    syncAll: (sources) => void run(sources.map(toTarget)),
    syncNew: (sourceId) => void run([{ id: sourceId, name: GALLERY_COPY.sourceFallbackName }]),
  };
}
