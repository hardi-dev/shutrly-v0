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
    // BR-GAL-004 refuses only when none passes, so the first accessible folder ends the check (D-25).
    if (result.ok) return { passed: 1, failures };
    failures.push({ name: source.name, code: result.code });
  }
  return { passed: 0, failures };
}

/** Publishes a draft once at least one folder still lists at publish time; a duration expiry starts now; selection groups are created (BR-GAL-004, BR-GAL-005, BR-SEL-001, AC-GAL-016…018). @param deps - repository, provider and clock @param context - verified workspace @param actorId - the signed-in owner @param galleryId - the gallery id @returns ok, a refusal naming the failing folders, or a state failure @throws GalleryError NOT_FOUND for another workspace's gallery */
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
      // F-10 D-10a: the client can pick from the moment the gallery opens (BR-SEL-001).
      await writer.createSelectionGroups();
      return { ok: true };
    },
  );
}
