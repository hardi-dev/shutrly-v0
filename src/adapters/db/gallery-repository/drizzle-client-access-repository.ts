import "server-only";

import { and, eq } from "drizzle-orm";

import type {
  ClientAccessRecord,
  ClientAccessRepositoryPort,
} from "@/features/gallery/application/ports/client-access-repository/client-access-repository.port";
import { parseAppLocale } from "@/shared/locale/locale";
import type { AppLocale } from "@/shared/locale/locale.types";

import type { DbExecutor } from "../client/client.types";
import { user } from "../schema/auth/auth";
import { client } from "../schema/booking/client";
import { project } from "../schema/booking/project";
import { gallery } from "../schema/gallery/gallery";
import { workspace } from "../schema/workspace/workspace";

type GalleryStatus = ClientAccessRecord["galleryStatus"];

function toGalleryStatus(value: string | null): GalleryStatus {
  if (value === null || value === "DRAFT" || value === "PUBLISHED" || value === "ARCHIVED") {
    return value;
  }
  throw new Error("Stored gallery status is invalid.");
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/**
 * Creates the client gate's token lookup: one query joining project, client, workspace and the
 * project's gallery (D-4). It is unscoped by design: the token is the only key a client has.
 * @param db - the request-scoped database
 * @returns the repository port
 */
/**
 * The owner's locale for a project link token, read per request (D-4).
 * @param db - the executor
 * @param token - the raw client access token
 * @returns the owner's locale, or null when the token is unknown
 */
async function ownerLocaleByToken(db: DbExecutor, token: string): Promise<AppLocale | null> {
  const row = (
    await db
      .select({ locale: user.locale })
      .from(project)
      .innerJoin(workspace, eq(workspace.id, project.workspaceId))
      .innerJoin(user, eq(user.id, workspace.ownerUserId))
      .where(eq(project.clientAccessToken, token))
      .limit(1)
  ).at(0);
  return row ? parseAppLocale(row.locale) : null;
}

/**
 * Drizzle adapter for the gallery's client-access reads.
 * @param db - the executor (request-scoped)
 * @returns the `ClientAccessRepositoryPort`
 */
export function createDrizzleClientAccessRepository(db: DbExecutor): ClientAccessRepositoryPort {
  return {
    findOwnerLocaleByTokenUnscoped: (token) => ownerLocaleByToken(db, token),
    async findByTokenUnscoped(token) {
      const row = (
        await db
          .select({
            workspaceId: project.workspaceId,
            projectId: project.id,
            projectStatus: project.status,
            projectTitle: project.title,
            clientName: client.name,
            workspaceName: workspace.name,
            brandName: workspace.brandName,
            galleryId: gallery.id,
            galleryStatus: gallery.status,
            expiresAt: gallery.expiresAt,
            passwordHash: gallery.passwordHash,
            passwordVersion: gallery.passwordVersion,
            contentVersion: gallery.contentVersion,
            finalDeliveryPublishedAt: gallery.finalDeliveryPublishedAt,
          })
          .from(project)
          .innerJoin(
            client,
            and(eq(client.workspaceId, project.workspaceId), eq(client.id, project.clientId)),
          )
          .innerJoin(workspace, eq(workspace.id, project.workspaceId))
          .leftJoin(
            gallery,
            and(eq(gallery.workspaceId, project.workspaceId), eq(gallery.projectId, project.id)),
          )
          .where(eq(project.clientAccessToken, token))
          .limit(1)
      ).at(0);
      if (!row) return null;
      const { clientName, workspaceName, brandName, galleryStatus, ...rest } = row;
      return {
        ...rest,
        clientFirstName: firstName(clientName),
        studioName: brandName ?? workspaceName,
        galleryStatus: toGalleryStatus(galleryStatus),
      };
    },
  };
}
