import "server-only";

import { and, desc, eq, lt, sql } from "drizzle-orm";

import type { WorkspaceRepositoryPort } from "@/features/workspace/application/ports/workspace-repository/workspace-repository.port";
import { normaliseInvoicePrefix } from "@/features/workspace/domain/invoice-prefix/invoice-prefix";
import { asOwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id";
import { normaliseWorkspaceProfile } from "@/features/workspace/domain/workspace-profile/workspace-profile";
import { workspaceIdSchema } from "@/shared/workspace-context/workspace-context.schema";

import type { Db } from "../client/client.types";
import { workspace } from "../schema/workspace/workspace";

const DUPLICATE_KEY = "23505";

function isDuplicateName(error: unknown): boolean {
  return (
    typeof error === "object" && error !== null && "code" in error && error.code === DUPLICATE_KEY
  );
}

function toRecord(row: typeof workspace.$inferSelect) {
  return {
    id: workspaceIdSchema.parse(row.id),
    ownerUserId: asOwnerUserId(row.ownerUserId),
    ...normaliseWorkspaceProfile({
      name: row.name,
      brandName: row.brandName ?? "",
      contactEmail: row.contactEmail ?? "",
      phone: row.phone ?? "",
      address: row.address ?? "",
    }),
    invoicePrefix: normaliseInvoicePrefix(row.invoicePrefix),
    currency: "IDR" as const,
    lastOpenedAt: row.lastOpenedAt,
  };
}

/** Creates the Drizzle workspace repository with all owner queries scoped to the workspace contract. @param db - the request-scoped Drizzle database @returns the workspace repository port */
// eslint-disable-next-line max-lines-per-function -- the repository exposes the complete workspace port
export function createDrizzleWorkspaceRepository(db: Db): WorkspaceRepositoryPort {
  return {
    async countForOwner(owner) {
      const rows = await db
        .select({ id: workspace.id })
        .from(workspace)
        .where(eq(workspace.ownerUserId, owner));
      return rows.length;
    },
    async create(owner, fields) {
      try {
        const rows = await db
          .insert(workspace)
          .values({
            ownerUserId: owner,
            name: fields.name,
            invoicePrefix: fields.invoicePrefix,
            currency: fields.currency,
          })
          .returning({ id: workspace.id });
        const row = rows.at(0);
        if (!row) throw new Error("workspace insert returned no row");
        return { ok: true as const, id: workspaceIdSchema.parse(row.id) };
      } catch (error) {
        if (isDuplicateName(error))
          return { ok: false as const, reason: "DUPLICATE_NAME" as const };
        throw error;
      }
    },
    async findForOwner(owner, id) {
      const rows = await db
        .select({ id: workspace.id, name: workspace.name })
        .from(workspace)
        .where(and(eq(workspace.ownerUserId, owner), eq(workspace.id, id)));
      const row = rows.at(0);
      return row ? { id: workspaceIdSchema.parse(row.id), name: row.name } : null;
    },
    async touchIfNotLatest(owner, context) {
      const rows = await db
        .update(workspace)
        .set({ lastOpenedAt: new Date() })
        .where(
          and(
            eq(workspace.ownerUserId, owner),
            eq(workspace.id, context.workspaceId),
            lt(
              workspace.lastOpenedAt,
              sql`(select max(${workspace.lastOpenedAt}) from ${workspace} where ${workspace.ownerUserId} = ${owner})`,
            ),
          ),
        )
        .returning({ id: workspace.id });
      return rows.length > 0;
    },
    async findLastOpened(owner) {
      const rows = await db
        .select({ id: workspace.id, name: workspace.name })
        .from(workspace)
        .where(eq(workspace.ownerUserId, owner))
        .orderBy(desc(workspace.lastOpenedAt), workspace.id)
        .limit(1);
      const row = rows.at(0);
      return row ? { id: workspaceIdSchema.parse(row.id), name: row.name } : null;
    },
    async listForOwner(owner) {
      const rows = await db
        .select({ id: workspace.id, name: workspace.name })
        .from(workspace)
        .where(eq(workspace.ownerUserId, owner))
        .orderBy(sql`lower(${workspace.name})`, workspace.id);
      return rows.map((row) => ({ id: workspaceIdSchema.parse(row.id), name: row.name }));
    },
    async getProfile(context) {
      const rows = await db.select().from(workspace).where(eq(workspace.id, context.workspaceId));
      const row = rows.at(0);
      return row ? toRecord(row) : null;
    },
    async updateProfile(context, fields) {
      try {
        const rows = await db
          .update(workspace)
          .set({
            name: fields.name,
            brandName: fields.brandName,
            contactEmail: fields.contactEmail,
            phone: fields.phone,
            address: fields.address,
            invoicePrefix: fields.invoicePrefix,
          })
          .where(eq(workspace.id, context.workspaceId))
          .returning({ id: workspace.id });
        return rows.length === 0
          ? { ok: false as const, reason: "NOT_FOUND" as const }
          : { ok: true as const };
      } catch (error) {
        if (isDuplicateName(error))
          return { ok: false as const, reason: "DUPLICATE_NAME" as const };
        throw error;
      }
    },
  };
}
