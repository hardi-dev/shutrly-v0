import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type { GalleryPasswordCipherPort } from "../../ports/gallery-password-cipher/gallery-password-cipher.port";
import type { GalleryRepositoryPort } from "../../ports/gallery-repository/gallery-repository.port";
import { toProjectView, toSourceView, toSummaryView } from "../gallery-views/gallery-views";
import type { GalleryPageView } from "../gallery-views/gallery-views.types";

/** Loads the gallery page: header facts, the Owner-visible password and the sources (AC-GAL-027, ADR-017). @param repository - gallery port @param cipher - password cipher @param context - verified workspace @param projectId - the project id @param now - the current instant @returns the page view @throws GalleryError NOT_FOUND when the project or its gallery is missing */
export async function getGalleryPage(
  repository: GalleryRepositoryPort,
  cipher: GalleryPasswordCipherPort,
  context: WorkspaceContext,
  projectId: string,
  now: Date,
): Promise<GalleryPageView> {
  const record = await repository.findPage(context, projectId);
  if (!record) throw new GalleryError("NOT_FOUND");
  return {
    project: toProjectView(record.project),
    gallery: await toSummaryView(record.summary, cipher, context, now),
    sources: record.sources.map(toSourceView),
  };
}
