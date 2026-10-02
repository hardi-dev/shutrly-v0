import "server-only";

import type { FieldType } from "@/features/booking/domain/booking-field/booking-field.types";
import type { PackageValue } from "@/features/booking/domain/package-value/package-value.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { ActiveChange } from "../category-repository/category-repository.port";

export interface ServiceItemRecord {
  readonly id: string;
  readonly definitionId: string;
  readonly definitionName: string;
  readonly unit: string | null;
  readonly valueType: "NUMBER" | "RANGE";
  readonly selectionRequired: boolean;
  readonly selectionType: "EDIT" | "PRINT" | null;
  readonly value: PackageValue;
}

export interface BookingFieldRecord {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly fieldType: FieldType;
  readonly isRequired: boolean;
  readonly options: readonly string[] | null;
}

export interface ServiceSummaryRecord {
  readonly id: string;
  readonly name: string;
  readonly categoryId: string;
  readonly basePrice: string;
  readonly isActive: boolean;
  readonly items: readonly ServiceItemRecord[];
}

export interface ServiceDetailRecord extends ServiceSummaryRecord {
  readonly categoryName: string;
  readonly currency: "IDR";
  readonly fields: readonly BookingFieldRecord[];
}

export interface ServiceInfo {
  readonly name: string;
  readonly categoryId: string;
  readonly basePrice: string;
  readonly editorUserId: string;
}

export interface BookingFieldInput {
  readonly name: string;
  readonly fieldType: FieldType;
  readonly isRequired: boolean;
  readonly options: readonly string[] | null;
  readonly editorUserId: string;
}

export type MoveDirection = "UP" | "DOWN";

export interface ServiceRepositoryPort {
  readonly listWithItems: (context: WorkspaceContext) => Promise<readonly ServiceSummaryRecord[]>;
  readonly findDetail: (
    context: WorkspaceContext,
    id: string,
  ) => Promise<ServiceDetailRecord | null>;
  readonly create: (
    context: WorkspaceContext,
    info: ServiceInfo,
  ) => Promise<
    | { readonly status: "CREATED"; readonly id: string }
    | { readonly status: "NAME_TAKEN" }
    | { readonly status: "INACTIVE_REFERENCE" }
  >;
  readonly updateInfo: (
    context: WorkspaceContext,
    id: string,
    info: ServiceInfo,
  ) => Promise<"UPDATED" | "NAME_TAKEN" | "INACTIVE_REFERENCE" | "NOT_FOUND">;
  readonly setActive: (context: WorkspaceContext, change: ActiveChange) => Promise<boolean>;
  readonly delete: (
    context: WorkspaceContext,
    id: string,
  ) => Promise<"DELETED" | "IN_USE" | "NOT_FOUND">;
  /** Locks the definition FOR SHARE, checks it is active, appends at the end (BR-CAT-005, BR-CAT-010). */
  readonly addItem: (
    context: WorkspaceContext,
    serviceId: string,
    definitionId: string,
    value: PackageValue,
    editorUserId: string,
  ) => Promise<"ADDED" | "DUPLICATE_DEFINITION" | "INACTIVE_REFERENCE" | "NOT_FOUND">;
  readonly updateItemValue: (
    context: WorkspaceContext,
    serviceId: string,
    itemId: string,
    value: PackageValue,
    editorUserId: string,
  ) => Promise<"UPDATED" | "NOT_FOUND">;
  readonly removeItem: (
    context: WorkspaceContext,
    serviceId: string,
    itemId: string,
  ) => Promise<boolean>;
  readonly moveItem: (
    context: WorkspaceContext,
    serviceId: string,
    itemId: string,
    direction: MoveDirection,
  ) => Promise<boolean>;
  /** Derives a unique key from the name inside the transaction (A-3). */
  readonly addField: (
    context: WorkspaceContext,
    serviceId: string,
    input: BookingFieldInput,
  ) => Promise<"ADDED" | "NAME_TAKEN" | "NOT_FOUND">;
  /** Never changes the key (A-3). */
  readonly updateField: (
    context: WorkspaceContext,
    serviceId: string,
    fieldId: string,
    input: BookingFieldInput,
  ) => Promise<"UPDATED" | "NAME_TAKEN" | "NOT_FOUND">;
  readonly removeField: (
    context: WorkspaceContext,
    serviceId: string,
    fieldId: string,
  ) => Promise<boolean>;
  readonly moveField: (
    context: WorkspaceContext,
    serviceId: string,
    fieldId: string,
    direction: MoveDirection,
  ) => Promise<boolean>;
}
