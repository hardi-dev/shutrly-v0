import "server-only";

import { advanceProject } from "@/features/booking/application/use-cases/advance-project/advance-project";
import { createProject } from "@/features/booking/application/use-cases/create-project/create-project";
import type { ProjectWriteResult } from "@/features/booking/application/use-cases/project-results/project-results.types";
import type { CreateProjectResult } from "@/features/booking/application/use-cases/project-results/project-results.types";
import type { GalleryRepositoryPort } from "@/features/gallery/application/ports/gallery-repository/gallery-repository.port";
import { createGalleryForBooking } from "@/features/gallery/application/use-cases/create-gallery-for-booking/create-gallery-for-booking";
import type { PreparedGalleryPassword } from "@/features/gallery/application/use-cases/create-gallery-for-booking/create-gallery-for-booking.types";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { BookingGalleryScope } from "./booking-gallery-scope.types";

/**
 * Creates the booked project's one gallery inside the booking work. A refusal throws, so the scope's transaction rolls the project back too (AC-GFL-003, C-005).
 * @param galleries - gallery port bound to the same transaction as the project
 * @param context - verified workspace
 * @param actorId - the Owner booking the project
 * @param projectId - the new or confirmed project
 * @param plan - the password prepared before the transaction
 */
async function bookGallery(
  galleries: GalleryRepositoryPort,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
  plan: PreparedGalleryPassword,
): Promise<void> {
  const outcome = await createGalleryForBooking({ galleries }, context, actorId, projectId, plan);
  if (!outcome.ok) throw new Error(`booked project ${projectId} refused its gallery`);
}

/**
 * Saves a project as DRAFT or BOOKED; a BOOKED project gets its gallery in the same work (BR-GAL-001, AC-GFL-001, AC-GFL-003).
 * @param scope - transaction-bound repositories
 * @param context - verified workspace
 * @param actorId - the Owner saving the project
 * @param values - the untrusted create form
 * @param locale - the formatting locale for validation
 * @param plan - the prepared gallery password for a BOOKED project, null for a DRAFT
 * @returns the create result; a validation failure writes nothing
 */
export async function createProjectWithGallery(
  scope: BookingGalleryScope,
  context: WorkspaceContext,
  actorId: string,
  values: unknown,
  locale: FormattingLocale,
  plan: PreparedGalleryPassword | null,
): Promise<CreateProjectResult> {
  const result = await createProject(
    scope.projects,
    scope.accessTokens,
    context,
    actorId,
    values,
    locale,
  );
  if (result.ok && plan)
    await bookGallery(scope.galleries, context, actorId, result.projectId, plan);
  return result;
}

/**
 * Confirms a DRAFT as BOOKED and creates its gallery in the same work; a refused step writes nothing (AC-GFL-002, BR-PRJ-004).
 * @param scope - transaction-bound repositories
 * @param context - verified workspace
 * @param actorId - the Owner confirming the booking
 * @param projectId - the project id
 * @param plan - the prepared gallery password
 * @returns undefined on success, or the refusal
 */
export async function confirmBookingWithGallery(
  scope: BookingGalleryScope,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
  plan: PreparedGalleryPassword,
): Promise<ProjectWriteResult> {
  const refusal = await advanceProject(
    scope.projects,
    context,
    actorId,
    projectId,
    "CONFIRM_BOOKING",
  );
  if (refusal) return refusal;
  await bookGallery(scope.galleries, context, actorId, projectId, plan);
  return undefined;
}
