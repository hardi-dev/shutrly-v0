import "server-only";

import { and, eq } from "drizzle-orm";

import type { ClientLinkReaderPort } from "@/features/gallery/application/ports/client-link-reader/client-link-reader.port";

import type { DbExecutor } from "../client/client.types";
import { project } from "../schema/booking/project";

/** Builds the Owner's client-link reader, scoped by workspace (C-101, D-20). @param db - the executor @returns the reader port */
export function createDrizzleClientLinkReader(db: DbExecutor): ClientLinkReaderPort {
  return {
    async findToken(context, projectId) {
      const rows = await db
        .select({ token: project.clientAccessToken })
        .from(project)
        .where(and(eq(project.workspaceId, context.workspaceId), eq(project.id, projectId)));
      return rows.at(0)?.token ?? null;
    },
  };
}
