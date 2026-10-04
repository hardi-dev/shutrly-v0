import "server-only";

import { expiryOnPublish } from "@/features/gallery/domain/gallery-expiry/gallery-expiry";
import {
  canPublish,
  effectiveGalleryStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { ActiveSourceRecord } from "../../ports/gallery-source-repository/gallery-source-repository.port";
import { withGalleryLock } from "../gallery-lock/gallery-lock";
import { galleryFailure } from "../gallery-results/gallery-results";
import type { PublishResult, PublishSourceFailure } from "../gallery-results/gallery-results.types";
import type { PublishGalleryDeps, SourceCheck } from "./publish-gallery.types";

async function checkSources(
  deps: PublishGalleryDeps,
  sources: readonly ActiveSourceRecord[],
): Promise<SourceCheck> {
  const failures: PublishSourceFailure[] = [];
  for (const source of sources) {
    const result = await deps.provider.getFolder(source.folder);
    if (!result.ok) failures.push({ name: source.name, code: result.code });
  }
  return { passed: sources.length - failures.length, failures };
}

/** Publishes a draft once at least one folder still lists at publish time; a duration expiry starts now (BR-GAL-004, BR-GAL-005, AC-GAL-016…018). @param deps - repository, provider and clock @param context - verified workspace @param actorId - the signed-in owner @param galleryId - the gallery id @returns ok, a refusal naming the failing folders, or a state failure @throws GalleryError NOT_FOUND for another workspace's gallery */
export async function publishGallery(
  deps: PublishGalleryDeps,
  context: WorkspaceContext,
  actorId: string,
  galleryId: string,
): Promise<PublishResult> {
  // The provider is called outside the lock; the write re-checks the state under it.
  const sources = await deps.sources.listActiveSources(context, galleryId);
  const check = await checkSources(deps, sources);
  if (check.passed === 0) {
    await withGalleryLock(deps.sources, context, galleryId, () => Promise.resolve(null));
    return { ok: false, code: "PUBLISH_REFUSED", failures: check.failures };
  }
  return withGalleryLock<PublishResult>(
    deps.sources,
    context,
    galleryId,
    async (gallery, writer) => {
      const status = effectiveGalleryStatus(gallery.status, gallery.expiresAt, deps.now);
      if (!canPublish(status, gallery.projectStatus)) return galleryFailure("INVALID_STATE");
      if ((await writer.countActiveSources()) === 0)
        return { ok: false, code: "PUBLISH_REFUSED", failures: [] };
      await writer.publish(
        expiryOnPublish(
          { status, expiresAt: gallery.expiresAt, expiryDays: gallery.expiryDays },
          deps.now,
        ),
        actorId,
        deps.now,
      );
      return { ok: true };
    },
  );
}
