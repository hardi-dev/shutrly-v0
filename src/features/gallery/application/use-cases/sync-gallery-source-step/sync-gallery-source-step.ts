import "server-only";

import {
  canSync,
  effectiveGalleryStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status";
import { startCursor, syncProgress, walkStep } from "@/features/gallery/domain/sync-step/sync-step";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type { GalleryRateLimitRule } from "../../ports/gallery-rate-limiter/gallery-rate-limiter.port";
import type {
  SyncClaim,
  SyncTarget,
} from "../../ports/gallery-source-repository/gallery-source-repository.port";
import { galleryFailure } from "../gallery-results/gallery-results";
import type { SyncGalleryDeps, SyncStepOutcome } from "./sync-gallery-source-step.types";

// D-19: sync run starts per workspace per minute; later steps of a run are not counted.
export const GALLERY_SYNC_RATE_LIMIT: GalleryRateLimitRule = { limit: 20, windowSeconds: 60 };

async function openCursor(
  deps: SyncGalleryDeps,
  claim: SyncClaim,
  folder: Parameters<SyncGalleryDeps["provider"]["getFolder"]>[0],
) {
  if (claim.cursor !== null) return { ok: true, cursor: claim.cursor } as const;
  const info = await deps.provider.getFolder(folder);
  return info.ok ? ({ ok: true, cursor: startCursor(folder, info.name) } as const) : info;
}

async function runStep(
  deps: SyncGalleryDeps,
  context: WorkspaceContext,
  claim: SyncClaim,
  target: SyncTarget,
): Promise<SyncStepOutcome> {
  const opened = await openCursor(deps, claim, target.folder);
  const step = opened.ok
    ? await walkStep(deps.provider.listFolder, opened.cursor, undefined, target.mappings)
    : opened;
  if (!step.ok) {
    await deps.sources.failRun(context, claim, step.code, deps.now);
    return { ok: true, status: "FAILED", errorCode: step.code };
  }
  const written = await deps.sources.commitStep(context, claim, step, deps.now);
  if (!written) return galleryFailure("INVALID_STATE");
  if (step.done) {
    // F-21: subfolders the Owner hasn't seen yet get a toast pointing to the mapping.
    const newFolders = await deps.sources.takeNewFolders(
      context,
      target.sourceId,
      step.cursor.folders,
    );
    return { ok: true, status: "SUCCEEDED", newFolders };
  }
  return { ok: true, status: "CONTINUE", ...syncProgress(step.cursor) };
}

/** Runs one step of a source's sync: claims the run (starting it, or continuing it from its cursor), lists a bounded part of the Drive tree outside any transaction, then writes what changed in one (BR-GAL-006, BR-GAL-007, D-7, D-8, D-19). @param deps - repositories, provider, rate limiter and clock @param context - verified workspace @param sourceId - the gallery source id @returns the step outcome or a refusal @throws GalleryError NOT_FOUND for another workspace's source */
export async function syncGallerySourceStep(
  deps: SyncGalleryDeps,
  context: WorkspaceContext,
  sourceId: string,
): Promise<SyncStepOutcome> {
  const target = await deps.sources.findSyncTarget(context, sourceId);
  if (!target) throw new GalleryError("NOT_FOUND");
  const status = effectiveGalleryStatus(target.gallery.status, target.gallery.expiresAt, deps.now);
  if (target.removed || !canSync(status, target.gallery.projectStatus)) {
    return galleryFailure("INVALID_STATE");
  }
  if (!target.runOpen) {
    const allowed = await deps.rateLimiter.hit(
      `gallery-sync:${context.workspaceId}`,
      GALLERY_SYNC_RATE_LIMIT,
    );
    if (!allowed) return galleryFailure("RATE_LIMITED");
  }
  const claim = await deps.sources.claimStep(context, sourceId, deps.now);
  if (!claim) return galleryFailure("SYNC_IN_PROGRESS");
  return runStep(deps, context, claim, target);
}
