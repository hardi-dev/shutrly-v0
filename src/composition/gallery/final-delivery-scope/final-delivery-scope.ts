import "server-only";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";
import { markProjectDelivered } from "@/features/booking/application/use-cases/mark-project-delivered/mark-project-delivered";
import { publishFinalDelivery } from "@/features/gallery/application/use-cases/publish-final-delivery/publish-final-delivery";
import type { FinalDeliveryWriteResult } from "@/features/gallery/application/use-cases/publish-final-delivery/publish-final-delivery.types";
import type { FinalDeliveryReason } from "@/features/gallery/domain/final-delivery/final-delivery.types";

import { withRequestDb } from "../../request-db/request-db";
import type { FinalDeliveryScope, FinalDeliveryTarget } from "./final-delivery-scope.types";

/** Carries the refusal out of the transaction so both sides roll back (D-17). */
class FinalDeliveryRefusal extends Error {
  constructor(readonly reasons: readonly FinalDeliveryReason[]) {
    super("final delivery refused");
  }
}

/**
 * Booking moves the project to DELIVERED (locking the project first), then the gallery records
 * final delivery (locking the gallery); any refusal from either side throws and rolls both back,
 * with every reason collected (BR-DEL-003, A-17, D-17, sequence 3).
 * @param scope - transaction-bound repositories and the clock
 * @param target - verified workspace, actor and project
 * @returns undefined once both moved
 */
export async function publishFinalDeliveryWithProject(
  scope: FinalDeliveryScope,
  target: FinalDeliveryTarget,
): Promise<undefined> {
  const { context, actorId, projectId } = target;
  const project = await markProjectDelivered(scope.projects, context, actorId, projectId);
  const deps = { sources: scope.sources, now: scope.now };
  const gallery = await publishFinalDelivery(deps, context, actorId, projectId);
  const reasons: FinalDeliveryReason[] = project ? ["PROJECT_STATUS"] : [];
  if (!gallery.ok) reasons.push(...gallery.reasons);
  if (reasons.length > 0) throw new FinalDeliveryRefusal(reasons);
  return undefined;
}

/**
 * Runs publishing final delivery in ONE transaction over the project and gallery repositories,
 * project first then gallery, the order F-09's cancel path uses (ADR-016, C-005, D-17).
 * @param db - the database
 * @param target - verified workspace, actor and project
 * @returns undefined, or the refusal with its reasons
 */
export async function runFinalDeliveryTransaction(
  db: Db,
  target: FinalDeliveryTarget,
): Promise<FinalDeliveryWriteResult> {
  try {
    await db.transaction((tx) =>
      publishFinalDeliveryWithProject(
        {
          projects: createDrizzleProjectRepository(tx),
          sources: createDrizzleGallerySourceRepository(tx),
          now: new Date(),
        },
        target,
      ),
    );
    return;
  } catch (error) {
    if (error instanceof FinalDeliveryRefusal) {
      return { ok: false, code: "REFUSED", reasons: error.reasons };
    }
    throw error;
  }
}

/** `runFinalDeliveryTransaction` on the request database. @param target - verified workspace, actor and project @returns undefined, or the refusal */
export function withFinalDeliveryScope(
  target: FinalDeliveryTarget,
): Promise<FinalDeliveryWriteResult> {
  return withRequestDb((db) => runFinalDeliveryTransaction(db, target));
}
