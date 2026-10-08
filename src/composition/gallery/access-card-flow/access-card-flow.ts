import "server-only";

import { createWebCryptoGalleryPasswordCipher } from "@/adapters/crypto/gallery-password-cipher/web-crypto-gallery-password-cipher";
import { createDrizzleClientLinkReader } from "@/adapters/db/gallery-repository/drizzle-client-link-reader";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import { getAccessCard } from "@/features/gallery/application/use-cases/get-access-card/get-access-card";
import type { AccessCardView } from "@/features/gallery/application/use-cases/get-access-card/get-access-card.types";

import { withRequestDb } from "../../request-db/request-db";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import {
  galleryIdOrNotFound,
  gallerySaveError,
} from "../gallery-flow-support/gallery-flow-support";

/** Loads the project page's *Akses klien* card; the link's origin is the app URL from the Worker env (D-20, AC-ACC-009). @param rawWorkspaceId - untrusted workspace id @param rawProjectId - untrusted project id @returns the card view, or null without a gallery */
export async function loadAccessCard(
  rawWorkspaceId: string,
  rawProjectId: string,
): Promise<AccessCardView | null> {
  const projectId = galleryIdOrNotFound(rawProjectId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withRequestDb((db, rc) =>
      getAccessCard(
        {
          galleries: createDrizzleGalleryRepository(db),
          cipher: createWebCryptoGalleryPasswordCipher(rc.env.GALLERY_PASSWORD_KEY),
          links: createDrizzleClientLinkReader(db),
          now: new Date(),
          origin: rc.env.BETTER_AUTH_URL,
        },
        verified.context,
        projectId,
      ),
    );
  } catch (error) {
    return gallerySaveError(error, verified.context.workspaceId, "access-card");
  }
}
