import "server-only";

import {
  accessCardState,
  maskedClientLink,
} from "@/features/gallery/domain/access-card/access-card";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import { getGalleryCard } from "../get-gallery-card/get-gallery-card";
import type { AccessCardView, GetAccessCardDeps } from "./get-access-card.types";

/**
 * Loads the *Akses klien* card: the client link (masked, with the full link to copy), the password
 * through F-09's Owner-only decryption and the expiry, or null while the project has no gallery
 * (spec §7, D-19, D-20, ADR-017, AC-ACC-009).
 * @param deps - gallery repository, cipher, link reader, clock and the app origin
 * @param context - verified workspace
 * @param projectId - the project id
 * @returns the card view, or null without a gallery
 * @throws GalleryError NOT_FOUND for another workspace's project
 */
export async function getAccessCard(
  deps: GetAccessCardDeps,
  context: WorkspaceContext,
  projectId: string,
): Promise<AccessCardView | null> {
  const card = await getGalleryCard(deps.galleries, deps.cipher, context, projectId, deps.now);
  if (!card.gallery) return null;
  const token = await deps.links.findToken(context, projectId);
  if (!token) throw new GalleryError("NOT_FOUND");
  const origin = new URL(deps.origin);
  return {
    state: accessCardState(card.gallery.status, card.project.status),
    projectId,
    gallery: card.gallery,
    link: `${origin.origin}/g/${token}`,
    maskedLink: maskedClientLink(origin.host, token),
  };
}
