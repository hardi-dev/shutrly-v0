import "server-only";

import { and, eq } from "drizzle-orm";

import type { ShareRecipientReaderPort } from "@/features/gallery/application/ports/share-recipient-reader/share-recipient-reader.port";

import type { DbExecutor } from "../client/client.types";
import { client } from "../schema/booking/client";
import { project } from "../schema/booking/project";

/**
 * Builds the share dialog's recipient reader: the project's client name and WhatsApp number,
 * scoped by workspace (C-101, BR-CLI-002).
 * @param db - the request-scoped executor
 * @returns the reader port
 */
export function createDrizzleShareRecipientReader(db: DbExecutor): ShareRecipientReaderPort {
  return {
    async findRecipient(context, projectId) {
      const rows = await db
        .select({ name: client.name, whatsappNumber: client.whatsappNumber })
        .from(project)
        .innerJoin(
          client,
          and(eq(client.workspaceId, project.workspaceId), eq(client.id, project.clientId)),
        )
        .where(and(eq(project.workspaceId, context.workspaceId), eq(project.id, projectId)))
        .limit(1);
      return rows.at(0) ?? null;
    },
  };
}
