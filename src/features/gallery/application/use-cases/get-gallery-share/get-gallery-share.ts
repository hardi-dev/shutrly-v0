import "server-only";

import { canShareGallery } from "@/features/gallery/domain/gallery-state/gallery-state";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import { getGalleryCard } from "../get-gallery-card/get-gallery-card";
import type { GalleryShare, GetGalleryShareDeps } from "./get-gallery-share.types";

/**
 * Loads what the share dialog needs for a project's gallery (D-9, BR-GAL-010, AC-GFL-021). The
 * password and the link come back only when the server allows sharing, so a refused share never
 * returns them (C-004, AC-GFL-025). Nothing here logs the password, the link or a WhatsApp URL (C-103).
 * @param deps - gallery repository, cipher, link reader, recipient reader, clock and the app origin
 * @param context - verified workspace
 * @param projectId - the project id
 * @returns the share facts, or `{ shareable: false }` when the gallery may not be shared
 * @throws GalleryError NOT_FOUND for another workspace's project, or when a shareable gallery has no client link
 */
export async function getGalleryShare(
  deps: GetGalleryShareDeps,
  context: WorkspaceContext,
  projectId: string,
): Promise<GalleryShare> {
  const card = await getGalleryCard(deps.galleries, deps.cipher, context, projectId, deps.now);
  const summary = card.gallery;
  if (
    !summary ||
    !canShareGallery({
      projectStatus: card.project.status,
      state: summary.state,
      activeSourceCount: summary.activeSourceCount,
    })
  ) {
    return { shareable: false };
  }
  const token = await deps.links.findToken(context, projectId);
  const recipient = await deps.recipients.findRecipient(context, projectId);
  if (!token || !recipient) throw new GalleryError("NOT_FOUND");
  return {
    shareable: true,
    projectTitle: card.project.title,
    recipient,
    password: summary.password,
    link: `${new URL(deps.origin).origin}/g/${token}`,
  };
}
