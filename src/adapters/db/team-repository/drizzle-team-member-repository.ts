import "server-only";

import { and, asc, eq, inArray, isNotNull, isNull, like, or, sql } from "drizzle-orm";

import type { ArchiveChange } from "@/features/booking/application/ports/client-repository/client-repository.port";
import type {
  AssignableMember,
  TeamMemberChange,
  TeamMemberPageQuery,
  TeamMemberRecord,
  TeamMemberRepositoryPort,
} from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import type { RoleRef } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";
import type { TeamMemberStatus } from "@/features/booking/domain/team-member/team-member.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { pgCode } from "../catalog-repository/pg-error";
import type { DbExecutor } from "../client/client.types";
import { sessionAssignment, teamMember, teamMemberRole, teamRole } from "../schema/booking/team";

const LIKE_SPECIAL = /[\\%_]/g;
const DUPLICATE_KEY = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

function searchCondition(query: TeamMemberPageQuery) {
  if (!query.search) return undefined;
  const escaped = query.search.text.replace(LIKE_SPECIAL, (character) => `\\${character}`);
  const pattern = `%${escaped}%`;
  const nameMatch = sql`${teamMember.name} ilike ${pattern} escape '\\'`;
  return query.search.digits
    ? or(nameMatch, like(teamMember.whatsappNumber, `%${query.search.digits}%`))
    : nameMatch;
}

function afterCondition(context: WorkspaceContext, afterId: string | null) {
  if (!afterId) return undefined;
  return sql`(lower(${teamMember.name}), ${teamMember.createdAt}, ${teamMember.id}) > (select lower(m.name), m.created_at, m.id from team_member m where m.workspace_id = ${context.workspaceId} and m.id = ${afterId})`;
}

function statusCondition(status: TeamMemberStatus) {
  return status === "ACTIVE" ? isNull(teamMember.archivedAt) : isNotNull(teamMember.archivedAt);
}

async function rolesByMember(db: DbExecutor, context: WorkspaceContext, memberIds: string[]) {
  const grouped = new Map<string, RoleRef[]>();
  if (memberIds.length === 0) return grouped;
  const rows = await db
    .select({ memberId: teamMemberRole.memberId, id: teamRole.id, name: teamRole.name })
    .from(teamMemberRole)
    .innerJoin(
      teamRole,
      and(
        eq(teamRole.workspaceId, teamMemberRole.workspaceId),
        eq(teamRole.id, teamMemberRole.roleId),
      ),
    )
    .where(
      and(
        eq(teamMemberRole.workspaceId, context.workspaceId),
        inArray(teamMemberRole.memberId, memberIds),
      ),
    )
    .orderBy(asc(sql`lower(${teamRole.name})`), asc(teamRole.id));
  for (const row of rows) {
    grouped.set(row.memberId, [
      ...(grouped.get(row.memberId) ?? []),
      { id: row.id, name: row.name },
    ]);
  }
  return grouped;
}

async function listPage(
  db: DbExecutor,
  context: WorkspaceContext,
  query: TeamMemberPageQuery,
): Promise<TeamMemberRecord[]> {
  const rows = await db
    .select({
      id: teamMember.id,
      name: teamMember.name,
      whatsappNumber: teamMember.whatsappNumber,
      email: teamMember.email,
      archivedAt: teamMember.archivedAt,
    })
    .from(teamMember)
    .where(
      and(
        eq(teamMember.workspaceId, context.workspaceId),
        statusCondition(query.status),
        searchCondition(query),
        afterCondition(context, query.afterId),
      ),
    )
    .orderBy(sql`lower(${teamMember.name})`, asc(teamMember.createdAt), asc(teamMember.id))
    .limit(query.limit);
  const roles = await rolesByMember(
    db,
    context,
    rows.map((row) => row.id),
  );
  return rows.map(({ archivedAt, ...row }) => ({
    ...row,
    roles: roles.get(row.id) ?? [],
    isArchived: archivedAt !== null,
  }));
}

async function count(db: DbExecutor, context: WorkspaceContext, status: TeamMemberStatus) {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(teamMember)
    .where(and(eq(teamMember.workspaceId, context.workspaceId), statusCondition(status)));
  return rows.at(0)?.count ?? 0;
}

// D-9: FOR SHARE keeps a concurrent role delete (which locks the role FOR UPDATE) out until we commit.
async function allRolesExist(
  tx: DbExecutor,
  context: WorkspaceContext,
  roleIds: readonly string[],
): Promise<boolean> {
  const locked = await tx
    .select({ id: teamRole.id })
    .from(teamRole)
    .where(and(eq(teamRole.workspaceId, context.workspaceId), inArray(teamRole.id, [...roleIds])))
    .orderBy(asc(teamRole.id))
    .for("share");
  return locked.length === roleIds.length;
}

async function replaceRoles(
  tx: DbExecutor,
  context: WorkspaceContext,
  memberId: string,
  roleIds: readonly string[],
) {
  await tx
    .delete(teamMemberRole)
    .where(
      and(
        eq(teamMemberRole.workspaceId, context.workspaceId),
        eq(teamMemberRole.memberId, memberId),
      ),
    );
  await tx
    .insert(teamMemberRole)
    .values(roleIds.map((roleId) => ({ workspaceId: context.workspaceId, memberId, roleId })));
}

async function findNumberHolder(db: DbExecutor, context: WorkspaceContext, whatsappNumber: string) {
  const rows = await db
    .select({ name: teamMember.name, archivedAt: teamMember.archivedAt })
    .from(teamMember)
    .where(
      and(
        eq(teamMember.workspaceId, context.workspaceId),
        eq(teamMember.whatsappNumber, whatsappNumber),
      ),
    )
    .limit(1);
  const holder = rows.at(0);
  return holder ? { name: holder.name, isArchived: holder.archivedAt !== null } : undefined;
}

// D-8: the unique index decides, races included; the holder is read after the failed write.
async function numberTakenOrRethrow(
  db: DbExecutor,
  context: WorkspaceContext,
  change: TeamMemberChange,
  error: unknown,
) {
  if (pgCode(error) !== DUPLICATE_KEY) throw error;
  const holder = await findNumberHolder(db, context, change.whatsappNumber);
  if (!holder) throw error;
  return { status: "NUMBER_TAKEN", holder } as const;
}

async function insertMember(tx: DbExecutor, context: WorkspaceContext, change: TeamMemberChange) {
  if (!(await allRolesExist(tx, context, change.roleIds))) return "NOT_FOUND" as const;
  const rows = await tx
    .insert(teamMember)
    .values({
      workspaceId: context.workspaceId,
      name: change.name,
      whatsappNumber: change.whatsappNumber,
      email: change.email,
      updatedBy: change.editorUserId,
    })
    .returning({ id: teamMember.id });
  const id = rows.at(0)?.id;
  if (!id) throw new Error("team member insert returned no row");
  await replaceRoles(tx, context, id, change.roleIds);
  return { status: "CREATED", id } as const;
}

async function createMember(db: DbExecutor, context: WorkspaceContext, change: TeamMemberChange) {
  try {
    return await db.transaction((tx) => insertMember(tx, context, change));
  } catch (error) {
    return numberTakenOrRethrow(db, context, change, error);
  }
}

async function saveMember(
  tx: DbExecutor,
  context: WorkspaceContext,
  id: string,
  change: TeamMemberChange,
) {
  const locked = await tx
    .select({ id: teamMember.id })
    .from(teamMember)
    .where(and(eq(teamMember.workspaceId, context.workspaceId), eq(teamMember.id, id)))
    .for("update");
  if (locked.length === 0 || !(await allRolesExist(tx, context, change.roleIds))) {
    return "NOT_FOUND" as const;
  }
  await tx
    .update(teamMember)
    .set({
      name: change.name,
      whatsappNumber: change.whatsappNumber,
      email: change.email,
      updatedBy: change.editorUserId,
      updatedAt: new Date(),
    })
    .where(and(eq(teamMember.workspaceId, context.workspaceId), eq(teamMember.id, id)));
  await replaceRoles(tx, context, id, change.roleIds);
  return "UPDATED" as const;
}

async function updateMember(
  db: DbExecutor,
  context: WorkspaceContext,
  id: string,
  change: TeamMemberChange,
) {
  try {
    return await db.transaction((tx) => saveMember(tx, context, id, change));
  } catch (error) {
    return numberTakenOrRethrow(db, context, change, error);
  }
}

async function setArchived(db: DbExecutor, context: WorkspaceContext, change: ArchiveChange) {
  const rows = await db
    .update(teamMember)
    .set({
      // Keep the first archive time when archiving twice, so the call is idempotent.
      archivedAt: change.isArchived ? sql`coalesce(${teamMember.archivedAt}, now())` : null,
      updatedBy: change.editorUserId,
      updatedAt: new Date(),
    })
    .where(and(eq(teamMember.workspaceId, context.workspaceId), eq(teamMember.id, change.id)))
    .returning({ id: teamMember.id });
  return rows.length > 0;
}

async function deleteUnassignedMember(tx: DbExecutor, context: WorkspaceContext, id: string) {
  const locked = await tx
    .select({ id: teamMember.id })
    .from(teamMember)
    .where(and(eq(teamMember.workspaceId, context.workspaceId), eq(teamMember.id, id)))
    .for("update");
  if (locked.length === 0) return "NOT_FOUND" as const;
  const assigned = await tx
    .select({ id: sessionAssignment.id })
    .from(sessionAssignment)
    .where(
      and(
        eq(sessionAssignment.workspaceId, context.workspaceId),
        eq(sessionAssignment.memberId, id),
      ),
    )
    .limit(1);
  if (assigned.length > 0) return "HAS_ASSIGNMENTS" as const;
  // The member's role rows go with it (ON DELETE CASCADE).
  await tx
    .delete(teamMember)
    .where(and(eq(teamMember.workspaceId, context.workspaceId), eq(teamMember.id, id)));
  return "DELETED" as const;
}

async function deleteMember(db: DbExecutor, context: WorkspaceContext, id: string) {
  try {
    return await db.transaction((tx) => deleteUnassignedMember(tx, context, id));
  } catch (error) {
    // An assignment landed between the check and the delete: the RESTRICT FK is the backstop.
    if (pgCode(error) === FOREIGN_KEY_VIOLATION) return "HAS_ASSIGNMENTS" as const;
    throw error;
  }
}

async function listAssignable(
  db: DbExecutor,
  context: WorkspaceContext,
): Promise<AssignableMember[]> {
  const rows = await db
    .select({ id: teamMember.id, name: teamMember.name })
    .from(teamMember)
    .where(and(eq(teamMember.workspaceId, context.workspaceId), isNull(teamMember.archivedAt)))
    .orderBy(sql`lower(${teamMember.name})`, asc(teamMember.createdAt), asc(teamMember.id));
  const roles = await rolesByMember(
    db,
    context,
    rows.map((row) => row.id),
  );
  return rows.map((row) => ({ ...row, roles: roles.get(row.id) ?? [] }));
}

/**
 * Drizzle implementation of the team-member port.
 * @param db - the request database or a transaction
 * @returns a repository scoped by the context passed to each call
 */
export function createDrizzleTeamMemberRepository(db: DbExecutor): TeamMemberRepositoryPort {
  return {
    listPage: (context, query) => listPage(db, context, query),
    count: (context, status) => count(db, context, status),
    create: (context, change) => createMember(db, context, change),
    update: (context, id, change) => updateMember(db, context, id, change),
    setArchived: (context, change) => setArchived(db, context, change),
    delete: (context, id) => deleteMember(db, context, id),
    listAssignable: (context) => listAssignable(db, context),
  };
}
