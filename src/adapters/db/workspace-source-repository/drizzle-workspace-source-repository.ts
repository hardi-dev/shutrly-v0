import "server-only";

import { and, eq, sql } from "drizzle-orm";

import type {
  NewWorkspaceSource,
  WorkspaceSourceRecord,
  WorkspaceSourceRepositoryPort,
} from "@/features/gallery/application/ports/workspace-source-repository/workspace-source-repository.port";
import { isSourceProvider } from "@/features/gallery/domain/source-provider/source-provider";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { workspaceSourceConfig } from "../schema/gallery/workspace-source-config";

const DUPLICATE_KEY = "23505";
const FOREIGN_KEY_KEY = "23503";

export function pgCode(error: unknown): string | undefined {
  const read = (value: unknown) =>
    typeof value === "object" && value !== null && "code" in value && typeof value.code === "string"
      ? value.code
      : undefined;
  if (read(error)) return read(error);
  if (typeof error === "object" && error !== null && "cause" in error) return read(error.cause);
  return undefined;
}

interface SourceRow {
  readonly id: string;
  readonly provider: string;
  readonly displayName: string;
  readonly isActive: boolean;
}

function toRecords(row: SourceRow): WorkspaceSourceRecord[] {
  return isSourceProvider(row.provider) ? [{ ...row, provider: row.provider }] : [];
}

// eslint-disable-next-line max-lines-per-function -- the repository exposes the complete source port
export function createDrizzleWorkspaceSourceRepository(
  db: DbExecutor,
): WorkspaceSourceRepositoryPort {
  const scope = (context: WorkspaceContext, id?: string) =>
    id
      ? and(
          eq(workspaceSourceConfig.workspaceId, context.workspaceId),
          eq(workspaceSourceConfig.id, id),
        )
      : eq(workspaceSourceConfig.workspaceId, context.workspaceId);

  return {
    async listForWorkspace(context) {
      const rows = await db
        .select({
          id: workspaceSourceConfig.id,
          provider: workspaceSourceConfig.provider,
          displayName: workspaceSourceConfig.displayName,
          isActive: workspaceSourceConfig.isActive,
        })
        .from(workspaceSourceConfig)
        .where(scope(context));
      return rows.flatMap(toRecords);
    },
    async create(context, source) {
      try {
        await db.insert(workspaceSourceConfig).values({
          workspaceId: context.workspaceId,
          provider: source.provider,
          displayName: source.displayName,
          configData: {},
          isActive: true,
          updatedBy: source.editorUserId,
        });
        return "CREATED";
      } catch (error) {
        if (pgCode(error) === DUPLICATE_KEY) return "NAME_TAKEN";
        throw error;
      }
    },
    async rename(context, change) {
      try {
        const rows = await db
          .update(workspaceSourceConfig)
          .set({
            displayName: change.displayName,
            updatedBy: change.editorUserId,
            updatedAt: new Date(),
          })
          .where(scope(context, change.id))
          .returning({ id: workspaceSourceConfig.id });
        return rows.length === 0 ? "NOT_FOUND" : "UPDATED";
      } catch (error) {
        if (pgCode(error) === DUPLICATE_KEY) return "NAME_TAKEN";
        throw error;
      }
    },
    async setActive(context, change) {
      const rows = await db
        .update(workspaceSourceConfig)
        .set({
          isActive: change.isActive,
          updatedBy: change.editorUserId,
          updatedAt: new Date(),
        })
        .where(scope(context, change.id))
        .returning({ id: workspaceSourceConfig.id });
      return rows.length > 0;
    },
    async delete(context, id) {
      try {
        const rows = await db
          .delete(workspaceSourceConfig)
          .where(scope(context, id))
          .returning({ id: workspaceSourceConfig.id });
        return rows.length === 0 ? "NOT_FOUND" : "DELETED";
      } catch (error) {
        if (pgCode(error) === FOREIGN_KEY_KEY) return "IN_USE";
        throw error;
      }
    },
    async seedDefault(context, source: NewWorkspaceSource) {
      await db.execute(sql`
        insert into workspace_source_config
          (workspace_id, provider, display_name, config_data, is_active, updated_by)
        select ${context.workspaceId}, ${source.provider}, ${source.displayName}, '{}'::jsonb, true, ${source.editorUserId}
        where not exists (
          select 1 from workspace_source_config where workspace_id = ${context.workspaceId}
        )
      `);
    },
  };
}
