import "server-only";

import { and, asc, eq, sql } from "drizzle-orm";

import type {
  BookingFieldRecord,
  ServiceDetailRecord,
  ServiceItemRecord,
  ServiceRepositoryPort,
  ServiceSummaryRecord,
} from "@/features/booking/application/ports/service-repository/service-repository.port";
import {
  fieldKeyFromName,
  uniqueFieldKey,
} from "@/features/booking/domain/booking-field/booking-field";
import type { FieldType } from "@/features/booking/domain/booking-field/booking-field.types";
import { canonicalIdrAmount } from "@/features/booking/domain/idr-amount/idr-amount";
import { parsePickMode } from "@/features/booking/domain/item-definition-type/item-definition-type";
import type { PackageValue } from "@/features/booking/domain/package-value/package-value.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import {
  service,
  serviceCategory,
  serviceFieldDefinition,
  serviceItem,
  serviceItemDefinition,
} from "../schema/booking/catalog";
import { isReferencedRowError, pgCode } from "./pg-error";

const DUPLICATE_KEY = "23505";
const FOREIGN_KEY_KEY = "23503";

interface RawItem {
  readonly id: string;
  readonly definitionId: string;
  readonly definitionName: string;
  readonly unit: string | null;
  readonly valueType: string;
  readonly selectionRequired: boolean;
  readonly pickMode: string | null;
  readonly allowsPickNotes: boolean;
  readonly value: unknown;
}

interface RawField {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly fieldType: string;
  readonly isRequired: boolean;
  readonly options: unknown;
}

export function toPackageValue(value: unknown): PackageValue | null {
  if (typeof value !== "object" || value === null || !("type" in value)) return null;
  if (value.type === "NUMBER" && "value" in value && typeof value.value === "string") {
    return { type: "NUMBER", value: value.value };
  }
  if (
    value.type === "RANGE" &&
    "min" in value &&
    "max" in value &&
    typeof value.min === "string" &&
    typeof value.max === "string"
  ) {
    return { type: "RANGE", min: value.min, max: value.max };
  }
  return null;
}

function toItem(row: RawItem): ServiceItemRecord | null {
  const value = toPackageValue(row.value);
  if (!value || (row.valueType !== "NUMBER" && row.valueType !== "RANGE")) return null;
  return {
    id: row.id,
    definitionId: row.definitionId,
    definitionName: row.definitionName,
    unit: row.unit,
    valueType: row.valueType,
    selectionRequired: row.selectionRequired,
    pickMode: parsePickMode(row.pickMode),
    allowsPickNotes: row.allowsPickNotes,
    value,
  };
}

function toField(row: RawField): BookingFieldRecord | null {
  if (!isFieldType(row.fieldType)) return null;
  if (row.options !== null && !isStringArray(row.options)) return null;
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    fieldType: row.fieldType,
    isRequired: row.isRequired,
    options: row.options,
  };
}

export function isFieldType(value: string): value is FieldType {
  return ["TEXT", "TEXTAREA", "NUMBER", "DATE", "BOOLEAN", "SELECT"].includes(value);
}

export function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

// eslint-disable-next-line max-lines-per-function -- exposes the complete service repository port
export function createDrizzleServiceRepository(db: DbExecutor): ServiceRepositoryPort {
  const scope = (context: WorkspaceContext, id?: string) =>
    id
      ? and(eq(service.workspaceId, context.workspaceId), eq(service.id, id))
      : eq(service.workspaceId, context.workspaceId);

  async function readItems(executor: DbExecutor, context: WorkspaceContext, serviceId: string) {
    const rows = await executor
      .select({
        id: serviceItem.id,
        definitionId: serviceItem.definitionId,
        definitionName: serviceItemDefinition.name,
        unit: serviceItemDefinition.unit,
        valueType: serviceItemDefinition.valueType,
        selectionRequired: serviceItemDefinition.selectionRequired,
        pickMode: serviceItemDefinition.pickMode,
        allowsPickNotes: serviceItemDefinition.allowsPickNotes,
        value: serviceItem.value,
      })
      .from(serviceItem)
      .innerJoin(serviceItemDefinition, eq(serviceItem.definitionId, serviceItemDefinition.id))
      .where(
        and(eq(serviceItem.workspaceId, context.workspaceId), eq(serviceItem.serviceId, serviceId)),
      )
      .orderBy(asc(serviceItem.sortOrder));
    return rows.flatMap((row) => {
      const item = toItem(row);
      return item ? [item] : [];
    });
  }

  async function readFields(executor: DbExecutor, context: WorkspaceContext, serviceId: string) {
    const rows = await executor
      .select({
        id: serviceFieldDefinition.id,
        key: serviceFieldDefinition.key,
        name: serviceFieldDefinition.name,
        fieldType: serviceFieldDefinition.fieldType,
        isRequired: serviceFieldDefinition.isRequired,
        options: serviceFieldDefinition.options,
      })
      .from(serviceFieldDefinition)
      .where(
        and(
          eq(serviceFieldDefinition.workspaceId, context.workspaceId),
          eq(serviceFieldDefinition.serviceId, serviceId),
        ),
      )
      .orderBy(asc(serviceFieldDefinition.sortOrder));
    return rows.flatMap((row) => {
      const field = toField(row);
      return field ? [field] : [];
    });
  }

  async function readService(executor: DbExecutor, context: WorkspaceContext, id?: string) {
    const rows = await executor
      .select({
        id: service.id,
        name: service.name,
        categoryId: service.categoryId,
        categoryName: serviceCategory.name,
        basePrice: service.basePrice,
        isActive: service.isActive,
      })
      .from(service)
      .innerJoin(
        serviceCategory,
        and(
          eq(service.categoryId, serviceCategory.id),
          eq(service.workspaceId, serviceCategory.workspaceId),
        ),
      )
      .where(scope(context, id));
    const row = rows.at(0);
    return row ? { ...row, basePrice: canonicalIdrAmount(row.basePrice) } : undefined;
  }

  return {
    async listWithItems(context): Promise<readonly ServiceSummaryRecord[]> {
      const rows = await db
        .select({
          id: service.id,
          name: service.name,
          categoryId: service.categoryId,
          basePrice: service.basePrice,
          isActive: service.isActive,
        })
        .from(service)
        .where(scope(context))
        .orderBy(service.name);
      const result: ServiceSummaryRecord[] = [];
      for (const row of rows) {
        result.push({
          ...row,
          basePrice: canonicalIdrAmount(row.basePrice),
          items: await readItems(db, context, row.id),
        });
      }
      return result;
    },
    async findDetail(context, id): Promise<ServiceDetailRecord | null> {
      const row = await readService(db, context, id);
      if (!row) return null;
      return {
        id: row.id,
        name: row.name,
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        basePrice: row.basePrice,
        isActive: row.isActive,
        currency: "IDR",
        items: await readItems(db, context, row.id),
        fields: await readFields(db, context, row.id),
      };
    },
    async create(context, info) {
      const category = await db
        .select({ isActive: serviceCategory.isActive })
        .from(serviceCategory)
        .where(
          and(
            eq(serviceCategory.workspaceId, context.workspaceId),
            eq(serviceCategory.id, info.categoryId),
          ),
        )
        .limit(1);
      if (!category.at(0)?.isActive) return { status: "INACTIVE_REFERENCE" };
      try {
        const rows = await db
          .insert(service)
          .values({
            workspaceId: context.workspaceId,
            categoryId: info.categoryId,
            name: info.name,
            basePrice: info.basePrice,
            updatedBy: info.editorUserId,
          })
          .returning({ id: service.id });
        const id = rows.at(0)?.id;
        if (!id) throw new Error("service insert returned no row");
        return { status: "CREATED", id };
      } catch (error) {
        if (pgCode(error) === DUPLICATE_KEY) return { status: "NAME_TAKEN" };
        if (pgCode(error) === FOREIGN_KEY_KEY) return { status: "INACTIVE_REFERENCE" };
        throw error;
      }
    },
    async updateInfo(context, id, info) {
      const category = await db
        .select({ isActive: serviceCategory.isActive })
        .from(serviceCategory)
        .where(
          and(
            eq(serviceCategory.workspaceId, context.workspaceId),
            eq(serviceCategory.id, info.categoryId),
          ),
        )
        .limit(1);
      if (!category.at(0)?.isActive) return "INACTIVE_REFERENCE";
      try {
        const rows = await db
          .update(service)
          .set({
            name: info.name,
            categoryId: info.categoryId,
            basePrice: info.basePrice,
            updatedBy: info.editorUserId,
            updatedAt: new Date(),
          })
          .where(scope(context, id))
          .returning({ id: service.id });
        return rows.length > 0 ? "UPDATED" : "NOT_FOUND";
      } catch (error) {
        if (pgCode(error) === DUPLICATE_KEY) return "NAME_TAKEN";
        if (pgCode(error) === FOREIGN_KEY_KEY) return "INACTIVE_REFERENCE";
        throw error;
      }
    },
    async setActive(context, change) {
      const rows = await db
        .update(service)
        .set({ isActive: change.isActive, updatedBy: change.editorUserId, updatedAt: new Date() })
        .where(scope(context, change.id))
        .returning({ id: service.id });
      return rows.length > 0;
    },
    async delete(context, id) {
      try {
        const rows = await db
          .delete(service)
          .where(scope(context, id))
          .returning({ id: service.id });
        return rows.length > 0 ? "DELETED" : "NOT_FOUND";
      } catch (error) {
        if (isReferencedRowError(error)) return "IN_USE";
        throw error;
      }
    },
    async addItem(context, serviceId, definitionId, value, editorUserId) {
      return db.transaction(async (tx) => {
        const serviceRow = await readService(tx, context, serviceId);
        if (!serviceRow) return "NOT_FOUND";
        const definitionRows = await tx
          .select({ isActive: serviceItemDefinition.isActive })
          .from(serviceItemDefinition)
          .where(
            and(
              eq(serviceItemDefinition.workspaceId, context.workspaceId),
              eq(serviceItemDefinition.id, definitionId),
            ),
          )
          .limit(1);
        const definition = definitionRows.at(0);
        if (!definition) return "NOT_FOUND";
        if (!definition.isActive) return "INACTIVE_REFERENCE";
        const nextOrder = await tx
          .select({ value: sql<number>`coalesce(max(${serviceItem.sortOrder}), -1) + 1` })
          .from(serviceItem)
          .where(
            and(
              eq(serviceItem.workspaceId, context.workspaceId),
              eq(serviceItem.serviceId, serviceId),
            ),
          );
        try {
          await tx.insert(serviceItem).values({
            workspaceId: context.workspaceId,
            serviceId,
            definitionId,
            value,
            sortOrder: nextOrder.at(0)?.value ?? 0,
            updatedBy: editorUserId,
          });
          return "ADDED";
        } catch (error) {
          if (pgCode(error) === DUPLICATE_KEY) return "DUPLICATE_DEFINITION";
          throw error;
        }
      });
    },
    async updateItemValue(context, serviceId, itemId, value, editorUserId) {
      const rows = await db
        .update(serviceItem)
        .set({ value, updatedBy: editorUserId, updatedAt: new Date() })
        .where(
          and(
            eq(serviceItem.workspaceId, context.workspaceId),
            eq(serviceItem.serviceId, serviceId),
            eq(serviceItem.id, itemId),
          ),
        )
        .returning({ id: serviceItem.id });
      return rows.length > 0 ? "UPDATED" : "NOT_FOUND";
    },
    async removeItem(context, serviceId, itemId) {
      const rows = await db
        .delete(serviceItem)
        .where(
          and(
            eq(serviceItem.workspaceId, context.workspaceId),
            eq(serviceItem.serviceId, serviceId),
            eq(serviceItem.id, itemId),
          ),
        )
        .returning({ id: serviceItem.id });
      return rows.length > 0;
    },
    async moveItem(context, serviceId, itemId, direction) {
      return moveRow(db, context, serviceId, itemId, direction, serviceItem);
    },
    async addField(context, serviceId, input) {
      return addFieldRow(db, context, serviceId, input);
    },
    async updateField(context, serviceId, fieldId, input) {
      try {
        const rows = await db
          .update(serviceFieldDefinition)
          .set({
            name: input.name,
            fieldType: input.fieldType,
            isRequired: input.isRequired,
            options: input.options,
            updatedBy: input.editorUserId,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(serviceFieldDefinition.workspaceId, context.workspaceId),
              eq(serviceFieldDefinition.serviceId, serviceId),
              eq(serviceFieldDefinition.id, fieldId),
            ),
          )
          .returning({ id: serviceFieldDefinition.id });
        return rows.length > 0 ? "UPDATED" : "NOT_FOUND";
      } catch (error) {
        if (pgCode(error) === DUPLICATE_KEY) return "NAME_TAKEN";
        throw error;
      }
    },
    async removeField(context, serviceId, fieldId) {
      const rows = await db
        .delete(serviceFieldDefinition)
        .where(
          and(
            eq(serviceFieldDefinition.workspaceId, context.workspaceId),
            eq(serviceFieldDefinition.serviceId, serviceId),
            eq(serviceFieldDefinition.id, fieldId),
          ),
        )
        .returning({ id: serviceFieldDefinition.id });
      return rows.length > 0;
    },
    async moveField(context, serviceId, fieldId, direction) {
      return moveRow(db, context, serviceId, fieldId, direction, serviceFieldDefinition);
    },
  };
}

async function addFieldRow(
  db: DbExecutor,
  context: WorkspaceContext,
  serviceId: string,
  input: Parameters<ServiceRepositoryPort["addField"]>[2],
) {
  const serviceRows = await db
    .select({ id: service.id })
    .from(service)
    .where(and(eq(service.workspaceId, context.workspaceId), eq(service.id, serviceId)))
    .limit(1);
  if (serviceRows.length === 0) return "NOT_FOUND" as const;
  const rows = await db
    .select({ key: serviceFieldDefinition.key })
    .from(serviceFieldDefinition)
    .where(
      and(
        eq(serviceFieldDefinition.workspaceId, context.workspaceId),
        eq(serviceFieldDefinition.serviceId, serviceId),
      ),
    );
  const key = uniqueFieldKey(
    fieldKeyFromName(input.name),
    rows.map((row) => row.key),
  );
  try {
    const inserted = await db
      .insert(serviceFieldDefinition)
      .values({
        workspaceId: context.workspaceId,
        serviceId,
        key,
        name: input.name,
        fieldType: input.fieldType,
        isRequired: input.isRequired,
        options: input.options,
        sortOrder: rows.length,
        updatedBy: input.editorUserId,
      })
      .returning({ id: serviceFieldDefinition.id });
    return inserted.length > 0 ? ("ADDED" as const) : ("NOT_FOUND" as const);
  } catch (error) {
    if (pgCode(error) === DUPLICATE_KEY) return "NAME_TAKEN" as const;
    throw error;
  }
}

async function moveRow(
  db: DbExecutor,
  context: WorkspaceContext,
  serviceId: string,
  rowId: string,
  direction: "UP" | "DOWN",
  table: typeof serviceItem | typeof serviceFieldDefinition,
): Promise<boolean> {
  const rows = await db
    .select({ id: table.id, sortOrder: table.sortOrder })
    .from(table)
    .where(and(eq(table.workspaceId, context.workspaceId), eq(table.serviceId, serviceId)))
    .orderBy(asc(table.sortOrder));
  const index = rows.findIndex((row) => row.id === rowId);
  if (index === -1) return false;
  const target = direction === "UP" ? index - 1 : index + 1;
  if (target < 0 || target >= rows.length) return true;
  await db.transaction(async (tx) => {
    await tx
      .update(table)
      .set({ sortOrder: rows[target].sortOrder })
      .where(eq(table.id, rows[index].id));
    await tx
      .update(table)
      .set({ sortOrder: rows[index].sortOrder })
      .where(eq(table.id, rows[target].id));
  });
  return true;
}
