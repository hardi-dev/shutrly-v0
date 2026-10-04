import "server-only";

import { generateGalleryPassword } from "@/features/gallery/domain/gallery-password/gallery-password";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type { GalleryRepositoryPort } from "../../ports/gallery-repository/gallery-repository.port";
import type { RandomIntPort } from "../../ports/random-int/random-int.port";

/** Proposes an easy-to-type password for a project's gallery, avoiding the client's name (BR-GAL-002, A-11, D-5). @param repository - gallery port @param randomInt - CSPRNG integer source @param context - verified workspace @param projectId - the project id @returns the proposal @throws GalleryError NOT_FOUND for another workspace's project */
export async function proposeGalleryPassword(
  repository: GalleryRepositoryPort,
  randomInt: RandomIntPort,
  context: WorkspaceContext,
  projectId: string,
): Promise<string> {
  const project = await repository.findProjectFacts(context, projectId);
  if (!project) throw new GalleryError("NOT_FOUND");
  return generateGalleryPassword(randomInt, project.clientName);
}
