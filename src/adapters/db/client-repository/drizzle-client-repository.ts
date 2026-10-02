import "server-only";

import { and, asc, eq, isNotNull, isNull, like, or, sql } from "drizzle-orm";

import type {
  ClientChange,
  ClientPageQuery,
  ClientRecord,
  ClientRepositoryPort,
} from "@/features/booking/application/ports/client-repository/client-repository.port";
import { socialLinksSchema } from "@/features/booking/domain/social-link/social-link.schema";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { pgCode } from "../catalog-repository/pg-error";
import type { DbExecutor } from "../client/client.types";
import { client } from "../schema/booking/client";

const LIKE_SPECIAL = /[\\%_]/g;
const DUPLICATE_KEY = "23505";

function searchCondition(query: ClientPageQuery) {
  if (!query.search) return undefined;
  const escaped = query.search.text.replace(LIKE_SPECIAL, (character) => `\\${character}`);
  const nameQuery = `%${escaped}%`;
  const nameMatch = sql`${client.name} ilike ${nameQuery} escape '\\'`;
  return query.search.digits
    ? or(nameMatch, like(client.whatsappNumber, `%${query.search.digits}%`))
    : nameMatch;
}

function afterCondition(context: WorkspaceContext, afterId: string | null) {
  if (!afterId) return undefined;
  return sql`(lower(${client.name}), ${client.createdAt}, ${client.id}) > (select lower(c.name), c.created_at, c.id from client c where c.workspace_id = ${context.workspaceId} and c.id = ${afterId})`;
}

function toRecord(row: {
  id: string;
  name: string;
  whatsappNumber: string | null;
  socialLinks: unknown;
  archivedAt: Date | null;
}): ClientRecord {
  return {
    id: row.id,
    name: row.name,
    whatsappNumber: row.whatsappNumber,
    socialLinks: socialLinksSchema.parse(row.socialLinks),
    isArchived: row.archivedAt !== null,
  };
}

export function createDrizzleClientRepository(db: DbExecutor): ClientRepositoryPort {
  return {
    async listPage(context, query) {
      const status =
        query.status === "ACTIVE" ? isNull(client.archivedAt) : isNotNull(client.archivedAt);
      const rows = await db
        .select({
          id: client.id,
          name: client.name,
          whatsappNumber: client.whatsappNumber,
          socialLinks: client.socialLinks,
          archivedAt: client.archivedAt,
        })
        .from(client)
        .where(
          and(
            eq(client.workspaceId, context.workspaceId),
            status,
            searchCondition(query),
            afterCondition(context, query.afterId),
          ),
        )
        .orderBy(sql`lower(${client.name})`, asc(client.createdAt), asc(client.id))
        .limit(query.limit);
      return rows.map(toRecord);
    },
    async count(context, status) {
      const archived =
        status === "ACTIVE" ? isNull(client.archivedAt) : isNotNull(client.archivedAt);
      const rows = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(client)
        .where(and(eq(client.workspaceId, context.workspaceId), archived));
      return rows.at(0)?.count ?? 0;
    },
    create: (context, change) => createClient(db, context, change),
    update: (context, id, change) => updateClient(db, context, id, change),
  };
}

async function updateClient(
  db: DbExecutor,
  context: WorkspaceContext,
  id: string,
  change: ClientChange,
) {
  try {
    const rows = await db
      .update(client)
      .set({
        name: change.name,
        whatsappNumber: change.whatsappNumber,
        socialLinks: change.socialLinks,
        updatedBy: change.editorUserId,
        updatedAt: new Date(),
      })
      .where(and(eq(client.workspaceId, context.workspaceId), eq(client.id, id)))
      .returning({ id: client.id });
    return rows.length > 0 ? ("UPDATED" as const) : ("NOT_FOUND" as const);
  } catch (error) {
    if (pgCode(error) !== DUPLICATE_KEY || change.whatsappNumber === null) throw error;
    const holder = await findNumberHolder(db, context, change.whatsappNumber);
    if (!holder) throw error;
    return { status: "NUMBER_TAKEN", holder } as const;
  }
}

async function createClient(db: DbExecutor, context: WorkspaceContext, change: ClientChange) {
  try {
    await db.insert(client).values({
      workspaceId: context.workspaceId,
      name: change.name,
      whatsappNumber: change.whatsappNumber,
      socialLinks: change.socialLinks,
      updatedBy: change.editorUserId,
    });
    return { status: "CREATED" } as const;
  } catch (error) {
    if (pgCode(error) !== DUPLICATE_KEY || change.whatsappNumber === null) throw error;
    const holder = await findNumberHolder(db, context, change.whatsappNumber);
    if (!holder) throw error;
    return { status: "NUMBER_TAKEN", holder } as const;
  }
}

async function findNumberHolder(db: DbExecutor, context: WorkspaceContext, whatsappNumber: string) {
  const rows = await db
    .select({ name: client.name, archivedAt: client.archivedAt })
    .from(client)
    .where(
      and(eq(client.workspaceId, context.workspaceId), eq(client.whatsappNumber, whatsappNumber)),
    )
    .limit(1);
  const holder = rows.at(0);
  return holder ? { name: holder.name, isArchived: holder.archivedAt !== null } : undefined;
}
