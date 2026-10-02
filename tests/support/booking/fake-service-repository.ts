/* eslint-disable @typescript-eslint/require-await -- the fake mirrors the asynchronous repository port */

import type { CategoryRepositoryPort } from "@/features/booking/application/ports/category-repository/category-repository.port";
import type { ItemDefinitionRepositoryPort } from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";
import type {
  BookingFieldInput,
  BookingFieldRecord,
  ServiceDetailRecord,
  ServiceInfo,
  ServiceItemRecord,
  ServiceRepositoryPort,
  ServiceSummaryRecord,
} from "@/features/booking/application/ports/service-repository/service-repository.port";
import {
  fieldKeyFromName,
  uniqueFieldKey,
} from "@/features/booking/domain/booking-field/booking-field";
import { catalogNameKey } from "@/features/booking/domain/catalog-name/catalog-name";
import type { PackageValue } from "@/features/booking/domain/package-value/package-value.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

interface StoredService {
  readonly id: string;
  readonly workspaceId: string;
  name: string;
  categoryId: string;
  categoryName: string;
  basePrice: string;
  isActive: boolean;
  items: StoredItem[];
  fields: StoredField[];
}

interface StoredItem extends ServiceItemRecord {
  readonly serviceId: string;
}

interface StoredField extends BookingFieldRecord {
  readonly serviceId: string;
}

export class FakeServiceRepository implements ServiceRepositoryPort {
  readonly rows: StoredService[] = [];
  readonly projectsByService = new Set<string>();

  constructor(
    readonly categories: CategoryRepositoryPort,
    readonly definitions: ItemDefinitionRepositoryPort,
  ) {}

  async listWithItems(context: WorkspaceContext): Promise<readonly ServiceSummaryRecord[]> {
    return this.rows.filter((row) => row.workspaceId === context.workspaceId).map(toSummary);
  }

  async findDetail(context: WorkspaceContext, id: string): Promise<ServiceDetailRecord | null> {
    const row = this.find(context, id);
    if (!row) return null;
    return {
      ...toSummary(row),
      categoryName: row.categoryName,
      currency: "IDR",
      fields: row.fields,
    };
  }

  async create(context: WorkspaceContext, info: ServiceInfo) {
    const category = (await this.categories.list(context)).find(
      (candidate) => candidate.id === info.categoryId,
    );
    if (!category || !category.isActive) return { status: "INACTIVE_REFERENCE" } as const;
    if (this.hasName(context.workspaceId, info.name)) return { status: "NAME_TAKEN" } as const;
    const row: StoredService = {
      id: crypto.randomUUID(),
      workspaceId: context.workspaceId,
      name: info.name,
      categoryId: info.categoryId,
      categoryName: category.name,
      basePrice: info.basePrice,
      isActive: true,
      items: [],
      fields: [],
    };
    this.rows.push(row);
    return { status: "CREATED", id: row.id } as const;
  }

  async updateInfo(context: WorkspaceContext, id: string, info: ServiceInfo) {
    const row = this.find(context, id);
    if (!row) return "NOT_FOUND" as const;
    const category = (await this.categories.list(context)).find(
      (candidate) => candidate.id === info.categoryId,
    );
    if (!category || !category.isActive) return "INACTIVE_REFERENCE" as const;
    if (this.hasName(context.workspaceId, info.name, id)) return "NAME_TAKEN" as const;
    row.name = info.name;
    row.categoryId = info.categoryId;
    row.categoryName = category.name;
    row.basePrice = info.basePrice;
    return "UPDATED" as const;
  }

  async setActive(context: WorkspaceContext, change: { id: string; isActive: boolean }) {
    const row = this.find(context, change.id);
    if (!row) return false;
    row.isActive = change.isActive;
    return true;
  }

  async delete(context: WorkspaceContext, id: string) {
    const index = this.rows.findIndex(
      (row) => row.workspaceId === context.workspaceId && row.id === id,
    );
    if (index === -1) return "NOT_FOUND" as const;
    if (this.projectsByService.has(id)) return "IN_USE" as const;
    this.rows.splice(index, 1);
    return "DELETED" as const;
  }

  async addItem(
    context: WorkspaceContext,
    serviceId: string,
    definitionId: string,
    value: PackageValue,
  ) {
    const service = this.find(context, serviceId);
    if (!service) return "NOT_FOUND" as const;
    const definition = await this.definitions.findById(context, definitionId);
    if (!definition) return "NOT_FOUND" as const;
    if (!definition.isActive) return "INACTIVE_REFERENCE" as const;
    if (service.items.some((item) => item.definitionId === definitionId)) {
      return "DUPLICATE_DEFINITION" as const;
    }
    service.items.push({
      id: crypto.randomUUID(),
      serviceId,
      definitionId,
      definitionName: definition.name,
      unit: definition.unit,
      valueType: definition.valueType,
      selectionRequired: definition.selectionRequired,
      selectionType: definition.selectionType,
      value,
    });
    return "ADDED" as const;
  }

  async updateItemValue(
    context: WorkspaceContext,
    serviceId: string,
    itemId: string,
    value: PackageValue,
  ) {
    const item = this.find(context, serviceId)?.items.find((candidate) => candidate.id === itemId);
    if (!item) return "NOT_FOUND" as const;
    const index = this.find(context, serviceId)?.items.indexOf(item) ?? -1;
    const service = this.find(context, serviceId);
    if (service && index >= 0) service.items[index] = { ...item, value };
    return "UPDATED" as const;
  }

  async removeItem(context: WorkspaceContext, serviceId: string, itemId: string) {
    const service = this.find(context, serviceId);
    if (!service) return false;
    const index = service.items.findIndex((item) => item.id === itemId);
    if (index === -1) return false;
    service.items.splice(index, 1);
    return true;
  }

  async moveItem(
    context: WorkspaceContext,
    serviceId: string,
    itemId: string,
    direction: "UP" | "DOWN",
  ) {
    const service = this.find(context, serviceId);
    if (!service) return false;
    return swap(service.items, itemId, direction);
  }

  async addField(context: WorkspaceContext, serviceId: string, input: BookingFieldInput) {
    const service = this.find(context, serviceId);
    if (!service) return "NOT_FOUND" as const;
    if (service.fields.some((field) => catalogNameKey(field.name) === catalogNameKey(input.name))) {
      return "NAME_TAKEN" as const;
    }
    const key = uniqueFieldKey(
      fieldKeyFromName(input.name),
      service.fields.map((field) => field.key),
    );
    service.fields.push({ id: crypto.randomUUID(), serviceId, key, ...input });
    return "ADDED" as const;
  }

  async updateField(
    context: WorkspaceContext,
    serviceId: string,
    fieldId: string,
    input: BookingFieldInput,
  ) {
    const service = this.find(context, serviceId);
    const field = service?.fields.find((candidate) => candidate.id === fieldId);
    if (!service || !field) return "NOT_FOUND" as const;
    if (
      service.fields.some(
        (candidate) =>
          candidate.id !== fieldId && catalogNameKey(candidate.name) === catalogNameKey(input.name),
      )
    ) {
      return "NAME_TAKEN" as const;
    }
    const index = service.fields.indexOf(field);
    service.fields[index] = { ...field, ...input };
    return "UPDATED" as const;
  }

  async removeField(context: WorkspaceContext, serviceId: string, fieldId: string) {
    const service = this.find(context, serviceId);
    if (!service) return false;
    const index = service.fields.findIndex((field) => field.id === fieldId);
    if (index === -1) return false;
    service.fields.splice(index, 1);
    return true;
  }

  async moveField(
    context: WorkspaceContext,
    serviceId: string,
    fieldId: string,
    direction: "UP" | "DOWN",
  ) {
    const service = this.find(context, serviceId);
    if (!service) return false;
    return swap(service.fields, fieldId, direction);
  }

  private find(context: WorkspaceContext, id: string): StoredService | undefined {
    return this.rows.find((row) => row.workspaceId === context.workspaceId && row.id === id);
  }

  private hasName(workspaceId: string, name: string, ignoredId?: string): boolean {
    return this.rows.some(
      (row) =>
        row.workspaceId === workspaceId &&
        row.id !== ignoredId &&
        catalogNameKey(row.name) === catalogNameKey(name),
    );
  }
}

function toSummary(row: StoredService): ServiceSummaryRecord {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.categoryId,
    basePrice: row.basePrice,
    isActive: row.isActive,
    items: row.items,
  };
}

function swap(rows: Array<{ readonly id: string }>, id: string, direction: "UP" | "DOWN"): boolean {
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) return false;
  const target = direction === "UP" ? index - 1 : index + 1;
  if (target < 0 || target >= rows.length) return true;
  [rows[index], rows[target]] = [rows[target], rows[index]];
  return true;
}

/* eslint-enable @typescript-eslint/require-await -- restore lint coverage after async fake methods */
