import "server-only";

import { galleryAllowedForProject } from "@/features/gallery/domain/gallery-status/gallery-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type { GalleryPasswordCipherPort } from "../../ports/gallery-password-cipher/gallery-password-cipher.port";
import type { GalleryRepositoryPort } from "../../ports/gallery-repository/gallery-repository.port";
import { toProjectView, toSummaryView } from "../gallery-views/gallery-views";
import type { GalleryCardView } from "../gallery-views/gallery-views.types";

/** Loads the Galeri card of the project detail: the gallery summary, or whether one can be created (BR-GAL-009, AC-GAL-001, AC-GAL-003). @param repository - gallery port @param cipher - password cipher @param context - verified workspace @param projectId - the project id @param now - the current instant @returns the card view @throws GalleryError NOT_FOUND for another workspace's project */
export async function getGalleryCard(
  repository: GalleryRepositoryPort,
  cipher: GalleryPasswordCipherPort,
  context: WorkspaceContext,
  projectId: string,
  now: Date,
): Promise<GalleryCardView> {
  const record = await repository.findCard(context, projectId);
  if (!record) throw new GalleryError("NOT_FOUND");
  const gallery = record.summary ? await toSummaryView(record.summary, cipher, context, now) : null;
  return {
    project: toProjectView(record.project),
    canCreate: gallery === null && galleryAllowedForProject(record.project.status),
    gallery,
  };
}
