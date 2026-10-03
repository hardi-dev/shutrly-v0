import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";

import type {
  CreateSnapshotResult,
  ProjectSnapshotInput,
} from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import {
  service,
  serviceFieldDefinition,
  serviceItem,
  serviceItemDefinition,
} from "../schema/booking/catalog";
import { client } from "../schema/booking/client";
import { project, projectFieldValue, projectItem, projectSession } from "../schema/booking/project";

type Rejection = Exclude<CreateSnapshotResult, { status: "CREATED" }>;

async function checkParents(
  tx: DbExecutor,
  context: WorkspaceContext,
  input: ProjectSnapshotInput,
): Promise<Rejection | null> {
  const clientRow = (
    await tx
      .select({ archivedAt: client.archivedAt })
      .from(client)
      .where(and(eq(client.workspaceId, context.workspaceId), eq(client.id, input.clientId)))
      .for("share")
  ).at(0);
  if (!clientRow) return { status: "NOT_FOUND" };
  if (clientRow.archivedAt !== null) return { status: "CLIENT_INACTIVE" };
  const serviceRow = (
    await tx
      .select({ isActive: service.isActive })
      .from(service)
      .where(and(eq(service.workspaceId, context.workspaceId), eq(service.id, input.serviceId)))
      .for("share")
  ).at(0);
  if (!serviceRow) return { status: "NOT_FOUND" };
  return serviceRow.isActive ? null : { status: "SERVICE_INACTIVE" };
}

async function lockDefinitions(
  tx: DbExecutor,
  context: WorkspaceContext,
  input: ProjectSnapshotInput,
) {
  const ids = input.items.map((item) => item.definitionId);
  if (ids.length === 0) return { rows: [], rejection: null };
  const rows = await tx
    .select()
    .from(serviceItemDefinition)
    .where(
      and(
        eq(serviceItemDefinition.workspaceId, context.workspaceId),
        inArray(serviceItemDefinition.id, ids),
      ),
    )
    .for("share");
  const inService = new Set(
    (
      await tx
        .select({ definitionId: serviceItem.definitionId })
        .from(serviceItem)
        .where(
          and(
            eq(serviceItem.workspaceId, context.workspaceId),
            eq(serviceItem.serviceId, input.serviceId),
          ),
        )
    ).map((row) => row.definitionId),
  );
  return { rows, rejection: findDefinitionRejection(input, rows, inService) };
}

function findDefinitionRejection(
  input: ProjectSnapshotInput,
  rows: readonly { id: string; isActive: boolean }[],
  inService: ReadonlySet<string>,
): Rejection | null {
  const seen = new Set<string>();
  for (const item of input.items) {
    const row = rows.find((candidate) => candidate.id === item.definitionId);
    if (!row) return { status: "NOT_FOUND" };
    if (seen.has(item.definitionId)) {
      return { status: "DUPLICATE_DEFINITION", definitionId: item.definitionId };
    }
    seen.add(item.definitionId);
    if (!row.isActive && !inService.has(item.definitionId)) {
      return { status: "DEFINITION_INACTIVE", definitionId: item.definitionId };
    }
  }
  return null;
}

async function insertItems(
  tx: DbExecutor,
  context: WorkspaceContext,
  input: ProjectSnapshotInput,
  projectId: string,
  definitions: readonly (typeof serviceItemDefinition.$inferSelect)[],
): Promise<void> {
  const items = input.items.flatMap((item, index) => {
    const definition = definitions.find((row) => row.id === item.definitionId);
    if (!definition) return [];
    return [
      {
        workspaceId: context.workspaceId,
        projectId,
        definitionId: item.definitionId,
        name: definition.name,
        valueType: definition.valueType,
        value: item.value,
        unit: definition.unit,
        selectionRequired: definition.selectionRequired,
        selectionType: definition.selectionType,
        sortOrder: index,
        updatedBy: input.actorId,
      },
    ];
  });
  if (items.length > 0) await tx.insert(projectItem).values(items);
}

async function insertFieldValues(
  tx: DbExecutor,
  context: WorkspaceContext,
  input: ProjectSnapshotInput,
  projectId: string,
): Promise<void> {
  const fields = await tx
    .select()
    .from(serviceFieldDefinition)
    .where(
      and(
        eq(serviceFieldDefinition.workspaceId, context.workspaceId),
        eq(serviceFieldDefinition.serviceId, input.serviceId),
      ),
    )
    .orderBy(asc(serviceFieldDefinition.sortOrder));
  if (fields.length === 0) return;
  await tx.insert(projectFieldValue).values(
    fields.map((field, index) => ({
      workspaceId: context.workspaceId,
      projectId,
      fieldKey: field.key,
      fieldName: field.name,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      options: field.options,
      value: input.fieldValues[field.key] ?? null,
      sortOrder: index,
      updatedBy: input.actorId,
    })),
  );
}

async function insertSessions(
  tx: DbExecutor,
  context: WorkspaceContext,
  input: ProjectSnapshotInput,
  projectId: string,
): Promise<void> {
  if (input.sessions.length === 0) return;
  await tx.insert(projectSession).values(
    input.sessions.map((session) => ({
      workspaceId: context.workspaceId,
      projectId,
      name: session.name,
      sessionDate: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      location: session.location,
      updatedBy: input.actorId,
    })),
  );
}

/** Writes the project and its snapshots in one transaction, locking the client, service and definitions FOR SHARE (D-4). @param db - request database @param context - verified workspace @param input - validated snapshot @returns the created id or why it was refused */
export function createSnapshot(
  db: DbExecutor,
  context: WorkspaceContext,
  input: ProjectSnapshotInput,
): Promise<CreateSnapshotResult> {
  return db.transaction(async (tx) => {
    const parents = await checkParents(tx, context, input);
    if (parents) return parents;
    const definitions = await lockDefinitions(tx, context, input);
    if (definitions.rejection) return definitions.rejection;
    const rows = await tx
      .insert(project)
      .values({
        workspaceId: context.workspaceId,
        clientId: input.clientId,
        serviceId: input.serviceId,
        title: input.title,
        notes: input.notes,
        agreedPrice: input.agreedPrice,
        status: input.status,
        clientAccessToken: input.accessToken,
        createdBy: input.actorId,
        updatedBy: input.actorId,
      })
      .returning({ id: project.id });
    const projectId = rows.at(0)?.id;
    if (!projectId) throw new Error("project insert returned no row");
    await insertItems(tx, context, input, projectId, definitions.rows);
    await insertFieldValues(tx, context, input, projectId);
    await insertSessions(tx, context, input, projectId);
    return { status: "CREATED", id: projectId } as const;
  });
}
