import { syncGallerySourceStep } from "@/features/gallery/application/use-cases/sync-gallery-source-step/sync-gallery-source-step";
import type { SyncStepOutcome } from "@/features/gallery/application/use-cases/sync-gallery-source-step/sync-gallery-source-step.types";
import type { SyncGalleryDeps } from "@/features/gallery/application/use-cases/sync-gallery-source-step/sync-gallery-source-step.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

/** Repeats sync steps until the run ends, like the browser does (TD D-9). Linking no longer syncs by itself (D-27). */
export async function syncSourceToEnd(
  deps: SyncGalleryDeps,
  context: WorkspaceContext,
  sourceId: string,
): Promise<SyncStepOutcome> {
  let outcome: SyncStepOutcome = { ok: false, code: "INVALID_STATE" };
  for (let step = 0; step < 50; step += 1) {
    outcome = await syncGallerySourceStep(deps, context, sourceId);
    if (!outcome.ok || outcome.status !== "CONTINUE") break;
  }
  return outcome;
}
