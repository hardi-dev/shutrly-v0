"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { GallerySourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import type { SyncOutcome } from "@/features/gallery/application/use-cases/sync-gallery-source/sync-gallery-source.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { SourceSyncPhase } from "../source-text/source-text.types";
import type { GallerySyncState, SyncReport, UseGallerySyncInput } from "./use-gallery-sync.types";

function report(outcomes: readonly [GallerySourceView, SyncOutcome][]): SyncReport {
  const failedNames = outcomes
    .filter(([, outcome]) => !outcome.ok || outcome.status === "FAILED")
    .map(([source]) => source.name ?? GALLERY_COPY.sourceFallbackName);
  return { synced: outcomes.length - failedNames.length, failedNames };
}

function toastFor(outcomes: readonly [GallerySourceView, SyncOutcome][]): void {
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

/** Runs *Sinkronkan* for one source or *Sinkronkan semua* one source at a time, so each gets its own request and result (D-9, AC-GAL-012). @param input - workspace and the sync action @returns the phases and the sync handlers */
export function useGallerySync(input: Readonly<UseGallerySyncInput>): GallerySyncState {
  const router = useRouter();
  const [phases, setPhases] = useState<ReadonlyMap<string, SourceSyncPhase>>(new Map());
  const setPhase = (ids: readonly string[], phase: SourceSyncPhase) => {
    setPhases(
      (current) =>
        new Map([...current, ...ids.map((id): [string, SourceSyncPhase] => [id, phase])]),
    );
  };
  const run = async (sources: readonly GallerySourceView[]) => {
    setPhase(
      sources.map((source) => source.id),
      "QUEUED",
    );
    const outcomes: [GallerySourceView, SyncOutcome][] = [];
    for (const source of sources) {
      setPhase([source.id], "SYNCING");
      try {
        outcomes.push([source, await input.syncSourceAction(input.workspaceId, source.id)]);
      } catch {
        outcomes.push([source, { ok: true, status: "FAILED", errorCode: "UNAVAILABLE" }]);
      }
      setPhase([source.id], null);
    }
    toastFor(outcomes);
    router.refresh();
  };
  const isRunning = [...phases.values()].some((phase) => phase !== null);
  const phaseOf = (sourceId: string) => phases.get(sourceId) ?? null;
  const syncOne = (source: GallerySourceView) => {
    void run([source]);
  };
  const syncAll = (sources: readonly GallerySourceView[]) => {
    void run(sources);
  };
  return { phaseOf, isRunning, syncOne, syncAll };
}
