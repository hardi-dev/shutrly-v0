import "server-only";

import { notFound } from "next/navigation";

import { createDrizzleDeliveryReader } from "@/adapters/db/gallery-repository/drizzle-delivery-reader";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";
import { ProjectError } from "@/features/booking/application/errors/project-errors/project-errors";
import { completeProject } from "@/features/booking/application/use-cases/complete-project/complete-project";
import type { ProjectDeliveryResult } from "@/features/booking/application/use-cases/mark-project-delivered/mark-project-delivered.types";
import { getDeliveryCard } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card";
import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";
import type { FinalDeliveryWriteResult } from "@/features/gallery/application/use-cases/publish-final-delivery/publish-final-delivery.types";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { withRequestDb } from "../../request-db/request-db";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import { withFinalDeliveryScope } from "../final-delivery-scope/final-delivery-scope";
import {
  galleryIdOrNotFound,
  gallerySaveError,
} from "../gallery-flow-support/gallery-flow-support";

function saveError(error: unknown, workspaceId: string, operation: string): never {
  if (error instanceof ProjectError && error.code === "NOT_FOUND") notFound();
  return gallerySaveError(error, workspaceId, operation);
}

/** Loads the project page's *Hasil akhir* card (D-20, AC-DEL-001). @param rawWorkspaceId - untrusted workspace id @param rawProjectId - untrusted project id @returns the card view */
export async function loadDeliveryCard(
  rawWorkspaceId: string,
  rawProjectId: string,
): Promise<DeliveryCardView> {
  const projectId = galleryIdOrNotFound(rawProjectId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withRequestDb((db) =>
      getDeliveryCard(
        { reader: createDrizzleDeliveryReader(db), now: new Date() },
        verified.context,
        projectId,
      ),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "delivery-card");
  }
}

/** *Publikasikan hasil akhir*: the gallery and the project move together, or neither (AC-DEL-001, -002). @param rawWorkspaceId - untrusted workspace id @param rawProjectId - untrusted project id @returns undefined, or the refusal with its reasons */
export async function publishFinalDeliveryEntry(
  rawWorkspaceId: string,
  rawProjectId: string,
): Promise<FinalDeliveryWriteResult> {
  const projectId = galleryIdOrNotFound(rawProjectId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withFinalDeliveryScope({
      context: verified.context,
      actorId: account.id,
      projectId,
    });
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "publish-final-delivery");
  }
}

/** *Tandai selesai* on a delivered project (AC-DEL-007). @param rawWorkspaceId - untrusted workspace id @param rawProjectId - untrusted project id @returns undefined, or PROJECT_STATUS */
export async function completeProjectEntry(
  rawWorkspaceId: string,
  rawProjectId: string,
): Promise<ProjectDeliveryResult> {
  const projectId = galleryIdOrNotFound(rawProjectId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withRequestDb((db) =>
      completeProject(
        createDrizzleProjectRepository(db),
        verified.context,
        account.id,
        projectId,
        new Date(),
      ),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "complete-project");
  }
}
