import "server-only";

import { and, asc, count, eq, inArray, isNull, sql } from "drizzle-orm";

import type {
  ClientOption,
  DefinitionRules,
  FilterClientOption,
  FilterServiceOption,
  MoveStatusResult,
  ProjectDetailRecord,
  ProjectFieldRecord,
  ProjectItemRecord,
  ProjectRepositoryPort,
  ServiceOptionGroup,
  ServiceSnapshotSource,
} from "@/features/booking/application/ports/project-repository/project-repository.port";
import { canonicalIdrAmount } from "@/features/booking/domain/idr-amount/idr-amount";
import { PROJECT_STATUSES } from "@/features/booking/domain/project-status/project-status";
import type { StepTransition } from "@/features/booking/domain/project-status/project-status.types";
import { compareSessions } from "@/features/booking/domain/session/session";
import type { SessionRecordShape } from "@/features/booking/domain/session/session.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import {
  createDrizzleServiceRepository,
  isFieldType,
  isStringArray,
  toPackageValue,
} from "../catalog-repository/drizzle-service-repository";
import type { DbExecutor } from "../client/client.types";
import { user } from "../schema/auth/auth";
import { service, serviceItemDefinition } from "../schema/booking/catalog";
import { client } from "../schema/booking/client";
import { project, projectFieldValue, projectItem, projectSession } from "../schema/booking/project";
import { createSnapshot } from "./drizzle-project-snapshot";

const LIKE_SPECIAL = /[\\%_]/g;
const TIME_LENGTH = 5;

function toItem(row: typeof projectItem.$inferSelect): ProjectItemRecord | null {
  const value = toPackageValue(row.value);
  if (!value || (row.valueType !== "NUMBER" && row.valueType !== "RANGE")) return null;
  if (row.selectionType !== null && row.selectionType !== "EDIT" && row.selectionType !== "PRINT") {
    return null;
  }
  return {
    id: row.id,
    definitionId: row.definitionId,
    name: row.name,
    unit: row.unit,
    valueType: row.valueType,
    selectionRequired: row.selectionRequired,
    selectionType: row.selectionType,
    value,
  };
}

function toBookingValue(value: unknown): string | boolean | null {
  return typeof value === "string" || typeof value === "boolean" ? value : null;
}

function toField(row: typeof projectFieldValue.$inferSelect): ProjectFieldRecord | null {
  if (!isFieldType(row.fieldType)) return null;
  if (row.options !== null && !isStringArray(row.options)) return null;
  return {
    id: row.id,
    key: row.fieldKey,
    name: row.fieldName,
    fieldType: row.fieldType,
    isRequired: row.isRequired,
    options: row.options,
    value: toBookingValue(row.value),
  };
}

function toSession(row: typeof projectSession.$inferSelect): SessionRecordShape {
  return {
    id: row.id,
    name: row.name,
    date: row.sessionDate,
    startTime: row.startTime?.slice(0, TIME_LENGTH) ?? null,
    endTime: row.endTime?.slice(0, TIME_LENGTH) ?? null,
    location: row.location,
    createdAt: row.createdAt.toISOString(),
  };
}

async function readChildren(db: DbExecutor, context: WorkspaceContext, projectId: string) {
  const where = (table: typeof projectItem | typeof projectFieldValue | typeof projectSession) =>
    and(eq(table.workspaceId, context.workspaceId), eq(table.projectId, projectId));
  const [items, fields, sessions] = await Promise.all([
    db.select().from(projectItem).where(where(projectItem)).orderBy(asc(projectItem.sortOrder)),
    db
      .select()
      .from(projectFieldValue)
      .where(where(projectFieldValue))
      .orderBy(asc(projectFieldValue.sortOrder)),
    db.select().from(projectSession).where(where(projectSession)),
  ]);
  return {
    items: items.flatMap((row) => toItem(row) ?? []),
    fields: fields.flatMap((row) => toField(row) ?? []),
    sessions: sessions.map(toSession).sort(compareSessions),
  };
}

async function findDetail(
  db: DbExecutor,
  context: WorkspaceContext,
  id: string,
): Promise<ProjectDetailRecord | null> {
  // The client access token is deliberately never selected (C-103, D-6).
  const row = (
    await db
      .select({
        id: project.id,
        title: project.title,
        notes: project.notes,
        agreedPrice: project.agreedPrice,
        status: project.status,
        cancelledAt: project.cancelledAt,
        cancelReason: project.cancelReason,
        cancelledByName: user.name,
        clientId: client.id,
        clientName: client.name,
        clientWhatsappNumber: client.whatsappNumber,
        serviceId: project.serviceId,
        serviceName: sql<string>`(select s.name from service s where s.workspace_id = ${project.workspaceId} and s.id = ${project.serviceId})`,
      })
      .from(project)
      .innerJoin(
        client,
        and(eq(client.workspaceId, project.workspaceId), eq(client.id, project.clientId)),
      )
      .leftJoin(user, eq(user.id, project.cancelledBy))
      .where(and(eq(project.workspaceId, context.workspaceId), eq(project.id, id)))
  ).at(0);
  const status = PROJECT_STATUSES.find((candidate) => candidate === row?.status);
  if (!row || !status) return null;
  const children = await readChildren(db, context, id);
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    agreedPrice: canonicalIdrAmount(row.agreedPrice),
    currency: "IDR",
    status,
    client: { id: row.clientId, name: row.clientName, whatsappNumber: row.clientWhatsappNumber },
    service: { id: row.serviceId, name: row.serviceName },
    ...children,
    cancellation: row.cancelledAt
      ? { at: row.cancelledAt.toISOString(), byName: row.cancelledByName, reason: row.cancelReason }
      : null,
  };
}

async function listServicesForFilter(
  db: DbExecutor,
  context: WorkspaceContext,
): Promise<readonly FilterServiceOption[]> {
  return db
    .select({ id: service.id, name: service.name, isActive: service.isActive })
    .from(service)
    .where(eq(service.workspaceId, context.workspaceId))
    .orderBy(sql`lower(${service.name})`, asc(service.id));
}

async function searchClientsForFilter(
  db: DbExecutor,
  context: WorkspaceContext,
  text: string,
  limit: number,
): Promise<readonly FilterClientOption[]> {
  const escaped = text.replace(LIKE_SPECIAL, (character) => `\\${character}`);
  const pattern = "%" + escaped + "%";
  const nameMatch = text === "" ? undefined : sql`${client.name} ilike ${pattern} escape '\\'`;
  const rows = await db
    .select({ id: client.id, name: client.name, archivedAt: client.archivedAt })
    .from(client)
    .where(and(eq(client.workspaceId, context.workspaceId), nameMatch))
    .orderBy(sql`lower(${client.name})`, asc(client.createdAt), asc(client.id))
    .limit(limit);
  return rows.map((row) => ({ id: row.id, name: row.name, isArchived: row.archivedAt !== null }));
}

async function findFilterClient(
  db: DbExecutor,
  context: WorkspaceContext,
  id: string,
): Promise<FilterClientOption | null> {
  const row = (
    await db
      .select({ id: client.id, name: client.name, archivedAt: client.archivedAt })
      .from(client)
      .where(and(eq(client.workspaceId, context.workspaceId), eq(client.id, id)))
  ).at(0);
  return row ? { id: row.id, name: row.name, isArchived: row.archivedAt !== null } : null;
}

async function moveStatus(
  db: DbExecutor,
  context: WorkspaceContext,
  id: string,
  transition: StepTransition,
  actorId: string,
): Promise<MoveStatusResult> {
  const scope = and(eq(project.workspaceId, context.workspaceId), eq(project.id, id));
  const moved = await db
    .update(project)
    .set({ status: transition.to, updatedBy: actorId, updatedAt: new Date() })
    .where(and(scope, eq(project.status, transition.from)))
    .returning({ id: project.id });
  if (moved.length > 0) return "MOVED";
  const existing = await db.select({ id: project.id }).from(project).where(scope);
  return existing.length > 0 ? "STALE" : "NOT_FOUND";
}

async function countSessions(
  db: DbExecutor,
  context: WorkspaceContext,
  id: string,
): Promise<number | null> {
  const exists = await db
    .select({ id: project.id })
    .from(project)
    .where(and(eq(project.workspaceId, context.workspaceId), eq(project.id, id)));
  if (exists.length === 0) return null;
  const rows = await db
    .select({ total: count() })
    .from(projectSession)
    .where(
      and(eq(projectSession.workspaceId, context.workspaceId), eq(projectSession.projectId, id)),
    );
  return rows.at(0)?.total ?? 0;
}

function toSnapshotSource(detail: {
  id: string;
  name: string;
  categoryName: string;
  basePrice: string;
  isActive: boolean;
  items: ServiceSnapshotSource["items"];
  fields: readonly {
    key: string;
    name: string;
    fieldType: ServiceSnapshotSource["fields"][number]["fieldType"];
    isRequired: boolean;
    options: readonly string[] | null;
  }[];
}): ServiceSnapshotSource {
  return {
    id: detail.id,
    name: detail.name,
    categoryName: detail.categoryName,
    basePrice: detail.basePrice,
    isActive: detail.isActive,
    items: detail.items,
    fields: detail.fields.map((field) => ({
      key: field.key,
      name: field.name,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      options: field.options,
    })),
  };
}

async function listActiveServiceOptions(
  db: DbExecutor,
  context: WorkspaceContext,
): Promise<readonly ServiceOptionGroup[]> {
  const services = createDrizzleServiceRepository(db);
  const active = (await services.listWithItems(context)).filter((row) => row.isActive);
  const groups = new Map<string, ServiceOptionGroup>();
  for (const summary of active) {
    const detail = await services.findDetail(context, summary.id);
    if (!detail) continue;
    const group = groups.get(detail.categoryId);
    groups.set(detail.categoryId, {
      categoryId: detail.categoryId,
      categoryName: detail.categoryName,
      services: [...(group?.services ?? []), toSnapshotSource(detail)],
    });
  }
  return [...groups.values()].sort((left, right) =>
    left.categoryName.localeCompare(right.categoryName),
  );
}

async function searchActiveClients(
  db: DbExecutor,
  context: WorkspaceContext,
  text: string,
  limit: number,
): Promise<readonly ClientOption[]> {
  const escaped = text.replace(LIKE_SPECIAL, (character) => `\\${character}`);
  const pattern = `%${escaped}%`;
  const nameMatch = text === "" ? undefined : sql`${client.name} ilike ${pattern} escape '\\'`;
  return db
    .select({
      id: client.id,
      name: client.name,
      whatsappNumber: client.whatsappNumber,
      projectCount: sql<number>`(select count(*)::int from project p where p.workspace_id = "client"."workspace_id" and p.client_id = "client"."id")`,
    })
    .from(client)
    .where(and(eq(client.workspaceId, context.workspaceId), isNull(client.archivedAt), nameMatch))
    .orderBy(sql`lower(${client.name})`, asc(client.createdAt), asc(client.id))
    .limit(limit);
}

async function findDefinitionRules(
  db: DbExecutor,
  context: WorkspaceContext,
  ids: readonly string[],
): Promise<readonly DefinitionRules[]> {
  if (ids.length === 0) return [];
  const rows = await db
    .select({
      id: serviceItemDefinition.id,
      valueType: serviceItemDefinition.valueType,
      selectionRequired: serviceItemDefinition.selectionRequired,
      isActive: serviceItemDefinition.isActive,
    })
    .from(serviceItemDefinition)
    .where(
      and(
        eq(serviceItemDefinition.workspaceId, context.workspaceId),
        inArray(serviceItemDefinition.id, [...ids]),
      ),
    );
  return rows.flatMap((row) =>
    row.valueType === "NUMBER" || row.valueType === "RANGE"
      ? [{ ...row, valueType: row.valueType }]
      : [],
  );
}

/** Builds the Drizzle project repository on a request database or transaction (ADR-003). @param db - request database @returns the project repository port */
export function createDrizzleProjectRepository(db: DbExecutor): ProjectRepositoryPort {
  return {
    createSnapshot: (context, input) => createSnapshot(db, context, input),
    async findServiceForSnapshot(context, serviceId) {
      const detail = await createDrizzleServiceRepository(db).findDetail(context, serviceId);
      return detail ? toSnapshotSource(detail) : null;
    },
    findDefinitionRules: (context, ids) => findDefinitionRules(db, context, ids),
    searchActiveClients: (context, text, limit) => searchActiveClients(db, context, text, limit),
    findDetail: (context, id) => findDetail(db, context, id),
    moveStatus: (context, id, transition, actorId) =>
      moveStatus(db, context, id, transition, actorId),
    countSessions: (context, id) => countSessions(db, context, id),
    findFilterClient: (context, id) => findFilterClient(db, context, id),
    listServicesForFilter: (context) => listServicesForFilter(db, context),
    searchClientsForFilter: (context, text, limit) =>
      searchClientsForFilter(db, context, text, limit),
    listActiveServiceOptions: (context) => listActiveServiceOptions(db, context),
  };
}
