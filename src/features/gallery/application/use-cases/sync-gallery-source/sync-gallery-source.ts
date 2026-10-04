import "server-only";

import {
  canSync,
  effectiveGalleryStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status";
import { walkFolderTree } from "@/features/gallery/domain/sync-plan/sync-plan";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type { GalleryRateLimitRule } from "../../ports/gallery-rate-limiter/gallery-rate-limiter.port";
import type { SyncClaim } from "../../ports/gallery-source-repository/gallery-source-repository.port";
import { galleryFailure } from "../gallery-results/gallery-results";
import type { SyncGalleryDeps, SyncOutcome } from "./sync-gallery-source.types";

// D-19: sync starts per workspace per minute.
export const GALLERY_SYNC_RATE_LIMIT: GalleryRateLimitRule = { limit: 20, windowSeconds: 60 };

async function runClaimedSync(
  deps: SyncGalleryDeps,
  context: WorkspaceContext,
  claim: SyncClaim,
  folder: Parameters<SyncGalleryDeps["provider"]["getFolder"]>[0],
): Promise<SyncOutcome> {
  const info = await deps.provider.getFolder(folder);
  const walk = info.ok ? await walkFolderTree(deps.provider.listFolder, folder) : info;
  if (!walk.ok) {
    await deps.sources.failSync(context, claim, walk.code, deps.now);
    return { ok: true, status: "FAILED", errorCode: walk.code };
  }
  const folderName = info.ok ? info.name : "";
  const written = await deps.sources.completeSync(
    context,
    claim,
    { ...walk, folderName },
    deps.now,
  );
  return written ? { ok: true, status: "SUCCEEDED" } : galleryFailure("INVALID_STATE");
}

/** Syncs one source: claims it, lists the Drive tree outside any transaction, then writes the result in one (BR-GAL-006, BR-GAL-007, D-7, D-8, D-19). @param deps - repositories, provider, rate limiter and clock @param context - verified workspace @param sourceId - the gallery source id @returns the sync outcome or a refusal @throws GalleryError NOT_FOUND for another workspace's source */
export async function syncGallerySource(
  deps: SyncGalleryDeps,
  context: WorkspaceContext,
  sourceId: string,
): Promise<SyncOutcome> {
  const target = await deps.sources.findSyncTarget(context, sourceId);
  if (!target) throw new GalleryError("NOT_FOUND");
  const status = effectiveGalleryStatus(target.gallery.status, target.gallery.expiresAt, deps.now);
  if (target.removed || !canSync(status, target.gallery.projectStatus)) {
    return galleryFailure("INVALID_STATE");
  }
  const allowed = await deps.rateLimiter.hit(
    `gallery-sync:${context.workspaceId}`,
    GALLERY_SYNC_RATE_LIMIT,
  );
  if (!allowed) return galleryFailure("RATE_LIMITED");
  const claim = await deps.sources.claimSync(context, sourceId, deps.now);
  if (!claim) return galleryFailure("SYNC_IN_PROGRESS");
  return runClaimedSync(deps, context, claim, target.folder);
}
