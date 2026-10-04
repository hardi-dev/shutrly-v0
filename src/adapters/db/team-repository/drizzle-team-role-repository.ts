import "server-only";

import { and, asc, eq, sql } from "drizzle-orm";

import type { TeamRoleRepositoryPort } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { pgCode } from "../catalog-repository/pg-error";
import type { DbExecutor } from "../client/client.types";
import { teamRole } from "../schema/booking/team";

const DUPLICATE_KEY = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

// D-10: the distinct members who hold the role or have an assignment in it.
function usageOf(workspaceId: string, roleId: ReturnType<typeof sql>) {
  return sql<number>`(select count(*)::int from (
    select member_id from team_member_role
      where workspace_id = ${workspaceId} and role_id = ${roleId}
    union
    select member_id from session_assignment
      where workspace_id = ${workspaceId} and role_id = ${roleId}
  ) used)`;
}

async function usageCount(db: DbExecutor, context: WorkspaceContext, id: string) {
  const roleId = sql`${id}::uuid`;
  const usage = usageOf(context.workspaceId, roleId);
  const result = await db.execute(sql`select ${usage} as usage`);
  return Number(result.rows.at(0)?.usage ?? 0);
}

async function deleteRole(db: DbExecutor, context: WorkspaceContext, id: string) {
  return db.transaction(async (tx) => {
    const locked = await tx
      .select({ id: teamRole.id })
      .from(teamRole)
      .where(and(eq(teamRole.workspaceId, context.workspaceId), eq(teamRole.id, id)))
      .for("update");
    if (locked.length === 0) return "NOT_FOUND" as const;
    const usage = await usageCount(tx, context, id);
    if (usage > 0) return { status: "IN_USE", usage } as const;
    await tx
      .delete(teamRole)
      .where(and(eq(teamRole.workspaceId, context.workspaceId), eq(teamRole.id, id)));
    return "DELETED" as const;
  });
}

async function deleteRoleOrReportUsage(db: DbExecutor, context: WorkspaceContext, id: string) {
  try {
    return await deleteRole(db, context, id);
  } catch (error) {
    if (pgCode(error) !== FOREIGN_KEY_VIOLATION) throw error;
    // A member took the role between the count and the delete: report the fresh usage.
    return { status: "IN_USE", usage: await usageCount(db, context, id) } as const;
  }
}

async function createRole(db: DbExecutor, context: WorkspaceContext, name: string, actor: string) {
  try {
    const rows = await db
      .insert(teamRole)
      .values({ workspaceId: context.workspaceId, name, updatedBy: actor })
      .returning({ id: teamRole.id });
    const id = rows.at(0)?.id;
    if (!id) throw new Error("team role insert returned no row");
    return { status: "CREATED", id } as const;
  } catch (error) {
    if (pgCode(error) === DUPLICATE_KEY) return { status: "DUPLICATE" } as const;
    throw error;
  }
}

async function renameRole(
  db: DbExecutor,
  context: WorkspaceContext,
  id: string,
  name: string,
  actor: string,
) {
  try {
    const rows = await db
      .update(teamRole)
      .set({ name, updatedBy: actor, updatedAt: new Date() })
      .where(and(eq(teamRole.workspaceId, context.workspaceId), eq(teamRole.id, id)))
      .returning({ id: teamRole.id });
    return rows.length > 0 ? ("UPDATED" as const) : ("NOT_FOUND" as const);
  } catch (error) {
    if (pgCode(error) === DUPLICATE_KEY) return { status: "DUPLICATE" } as const;
    throw error;
  }
}

/**
 * Drizzle implementation of the team-role port.
 * @param db - the request database or a transaction
 * @returns a repository scoped by the context passed to each call
 */
export function createDrizzleTeamRoleRepository(db: DbExecutor): TeamRoleRepositoryPort {
  return {
    list: async (context) =>
      db
        .select({
          id: teamRole.id,
          name: teamRole.name,
          usage: usageOf(context.workspaceId, sql`${teamRole.id}`),
        })
        .from(teamRole)
        .where(eq(teamRole.workspaceId, context.workspaceId))
        .orderBy(asc(sql`lower(${teamRole.name})`), asc(teamRole.id)),
    create: (context, name, actorId) => createRole(db, context, name, actorId),
    rename: (context, id, name, actorId) => renameRole(db, context, id, name, actorId),
    delete: (context, id) => deleteRoleOrReportUsage(db, context, id),
    async seedDefaults(context, names) {
      if (names.length === 0) return;
      await db
        .insert(teamRole)
        .values(names.map((name) => ({ workspaceId: context.workspaceId, name })))
        .onConflictDoNothing();
    },
  };
}
