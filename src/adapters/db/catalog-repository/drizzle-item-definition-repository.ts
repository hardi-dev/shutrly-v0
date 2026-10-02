import "server-only";

import { and, eq, sql } from "drizzle-orm";

import type {
  ItemDefinitionRecord,
  ItemDefinitionRepositoryPort,
} from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { serviceItem, serviceItemDefinition } from "../schema/booking/catalog";
import { pgCode } from "./pg-error";

const DUPLICATE_KEY = "23505";
const FOREIGN_KEY_KEY = "23503";

interface DefinitionRow {
  readonly id: string;
  readonly name: string;
  readonly valueType: string;
  readonly unit: string | null;
  readonly selectionRequired: boolean;
  readonly selectionType: string | null;
  readonly isActive: boolean;
  readonly usageCount: number | string;
}

function toRecord(row: DefinitionRow): ItemDefinitionRecord | null {
  if (row.valueType !== "NUMBER" && row.valueType !== "RANGE") return null;
  if (row.selectionType !== null && row.selectionType !== "EDIT" && row.selectionType !== "PRINT")
    return null;
  return {
    id: row.id,
    name: row.name,
    valueType: row.valueType,
    unit: row.unit,
    selectionRequired: row.selectionRequired,
    selectionType: row.selectionType,
    isActive: row.isActive,
    usageCount: Number(row.usageCount),
  };
}

const columns = {
  id: serviceItemDefinition.id,
  name: serviceItemDefinition.name,
  valueType: serviceItemDefinition.valueType,
  unit: serviceItemDefinition.unit,
  selectionRequired: serviceItemDefinition.selectionRequired,
  selectionType: serviceItemDefinition.selectionType,
  isActive: serviceItemDefinition.isActive,
  usageCount: sql<number>`count(${serviceItem.id})`,
};

// eslint-disable-next-line max-lines-per-function -- exposes the complete item-definition repository port
export function createDrizzleItemDefinitionRepository(
  db: DbExecutor,
): ItemDefinitionRepositoryPort {
  const listRows = async (context: WorkspaceContext, id?: string) =>
    db
      .select(columns)
      .from(serviceItemDefinition)
      .leftJoin(serviceItem, eq(serviceItem.definitionId, serviceItemDefinition.id))
      .where(
        id
          ? and(
              eq(serviceItemDefinition.workspaceId, context.workspaceId),
              eq(serviceItemDefinition.id, id),
            )
          : eq(serviceItemDefinition.workspaceId, context.workspaceId),
      )
      .groupBy(serviceItemDefinition.id)
      .orderBy(serviceItemDefinition.name);

  return {
    async list(context) {
      const rows = await listRows(context);
      return rows.flatMap((row) => {
        const record = toRecord(row);
        return record ? [record] : [];
      });
    },
    async findById(context, id) {
      const row = (await listRows(context, id)).at(0);
      return row ? toRecord(row) : null;
    },
    async create(context, input) {
      try {
        await db.insert(serviceItemDefinition).values({
          workspaceId: context.workspaceId,
          name: input.name,
          valueType: input.valueType,
          unit: input.unit,
          selectionRequired: input.selectionRequired,
          selectionType: input.selectionType,
          updatedBy: input.editorUserId,
        });
        return "CREATED";
      } catch (error) {
        if (pgCode(error) === DUPLICATE_KEY) return "NAME_TAKEN";
        throw error;
      }
    },
    async update(context, id, input) {
      try {
        const rows = await db
          .update(serviceItemDefinition)
          .set({
            name: input.name,
            valueType: input.valueType,
            unit: input.unit,
            selectionRequired: input.selectionRequired,
            selectionType: input.selectionType,
            updatedBy: input.editorUserId,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(serviceItemDefinition.workspaceId, context.workspaceId),
              eq(serviceItemDefinition.id, id),
              sql`(
                (${serviceItemDefinition.valueType} = ${input.valueType}
                  and ${serviceItemDefinition.selectionRequired} = ${input.selectionRequired}
                  and ${serviceItemDefinition.selectionType} is not distinct from ${input.selectionType})
                or not exists (
                  select 1 from ${serviceItem}
                  where ${serviceItem.workspaceId} = ${context.workspaceId}
                    and ${serviceItem.definitionId} = ${id}
                )
              )`,
            ),
          )
          .returning({ id: serviceItemDefinition.id });
        if (rows.length > 0) return "UPDATED";
        const exists = await db
          .select({ id: serviceItemDefinition.id })
          .from(serviceItemDefinition)
          .where(
            and(
              eq(serviceItemDefinition.workspaceId, context.workspaceId),
              eq(serviceItemDefinition.id, id),
            ),
          )
          .limit(1);
        return exists.length === 0 ? "NOT_FOUND" : "LOCKED";
      } catch (error) {
        if (pgCode(error) === DUPLICATE_KEY) return "NAME_TAKEN";
        throw error;
      }
    },
    async setActive(context, change) {
      const rows = await db
        .update(serviceItemDefinition)
        .set({ isActive: change.isActive, updatedBy: change.editorUserId, updatedAt: new Date() })
        .where(
          and(
            eq(serviceItemDefinition.workspaceId, context.workspaceId),
            eq(serviceItemDefinition.id, change.id),
          ),
        )
        .returning({ id: serviceItemDefinition.id });
      return rows.length > 0;
    },
    async delete(context, id) {
      try {
        const rows = await db
          .delete(serviceItemDefinition)
          .where(
            and(
              eq(serviceItemDefinition.workspaceId, context.workspaceId),
              eq(serviceItemDefinition.id, id),
            ),
          )
          .returning({ id: serviceItemDefinition.id });
        return rows.length > 0 ? "DELETED" : "NOT_FOUND";
      } catch (error) {
        if (pgCode(error) === FOREIGN_KEY_KEY) return "IN_USE";
        throw error;
      }
    },
    async seedDefaults(context, defaults) {
      if (defaults.length === 0) return;
      await db
        .insert(serviceItemDefinition)
        .values(
          defaults.map((input) => ({
            workspaceId: context.workspaceId,
            name: input.name,
            valueType: input.valueType,
            unit: input.unit,
            selectionRequired: input.selectionRequired,
            selectionType: input.selectionType,
            updatedBy: input.editorUserId,
          })),
        )
        .onConflictDoNothing();
    },
  };
}
