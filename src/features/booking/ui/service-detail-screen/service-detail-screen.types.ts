import type { CategoryRecord } from "@/features/booking/application/ports/category-repository/category-repository.port";
import type { ItemDefinitionRecord } from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";
import type {
  BookingFieldRecord,
  ServiceItemRecord,
} from "@/features/booking/application/ports/service-repository/service-repository.port";
import type { CatalogDeleteResult } from "@/features/booking/application/use-cases/catalog-results/catalog-results.types";
import type { CatalogWriteResult } from "@/features/booking/application/use-cases/catalog-results/catalog-results.types";
import type {
  ServiceDetailView,
  ServiceWriteResult,
} from "@/features/booking/application/use-cases/service-results/service-results.types";

export interface ServiceDetailScreenProps {
  readonly service: ServiceDetailView;
  readonly workspaceId?: string;
  readonly setActiveAction?: (
    workspaceId: string,
    kind: "service",
    id: string,
    isActive: boolean,
  ) => Promise<void>;
  readonly removeAction?: (
    workspaceId: string,
    kind: "service",
    id: string,
  ) => Promise<CatalogDeleteResult>;
  readonly definitions?: readonly ItemDefinitionRecord[];
  readonly categories?: readonly CategoryRecord[];
  readonly updateServiceInfoAction?: (
    workspaceId: string,
    serviceId: string,
    values: unknown,
  ) => Promise<ServiceWriteResult | undefined>;
  readonly addItemAction?: (
    workspaceId: string,
    serviceId: string,
    values: { readonly definitionId: string; readonly value: unknown },
  ) => Promise<CatalogWriteResult | undefined>;
  readonly updateItemAction?: (
    workspaceId: string,
    serviceId: string,
    itemId: string,
    values: { readonly value: unknown },
  ) => Promise<CatalogWriteResult | undefined>;
  readonly removeItemAction?: (
    workspaceId: string,
    serviceId: string,
    itemId: string,
  ) => Promise<void>;
  readonly moveItemAction?: (
    workspaceId: string,
    serviceId: string,
    itemId: string,
    direction: "UP" | "DOWN",
  ) => Promise<CatalogWriteResult | undefined>;
  readonly addFieldAction?: (
    workspaceId: string,
    serviceId: string,
    values: unknown,
  ) => Promise<CatalogWriteResult | undefined>;
  readonly updateFieldAction?: (
    workspaceId: string,
    serviceId: string,
    fieldId: string,
    values: unknown,
  ) => Promise<CatalogWriteResult | undefined>;
  readonly removeFieldAction?: (
    workspaceId: string,
    serviceId: string,
    fieldId: string,
  ) => Promise<void>;
  readonly moveFieldAction?: (
    workspaceId: string,
    serviceId: string,
    fieldId: string,
    direction: "UP" | "DOWN",
  ) => Promise<CatalogWriteResult | undefined>;
}

export interface ServiceDetailDialogs {
  readonly infoOpen: boolean;
  readonly itemOpen: boolean;
  readonly fieldOpen: boolean;
  readonly editingItem?: ServiceItemRecord;
  readonly editingField?: BookingFieldRecord;
  readonly deletingItem?: ServiceItemRecord;
  readonly deletingField?: BookingFieldRecord;
  readonly openEditInfo: () => void;
  readonly openAddItem: () => void;
  readonly openEditItem: (item: ServiceItemRecord) => void;
  readonly openAddField: () => void;
  readonly openEditField: (field: BookingFieldRecord) => void;
  readonly setInfoOpen: (open: boolean) => void;
  readonly setItemOpen: (open: boolean) => void;
  readonly setFieldOpen: (open: boolean) => void;
  readonly openDeleteItem: (item: ServiceItemRecord) => void;
  readonly openDeleteField: (field: BookingFieldRecord) => void;
  readonly closeDelete: () => void;
  readonly moveItemUp: (item: ServiceItemRecord) => void;
  readonly moveItemDown: (item: ServiceItemRecord) => void;
  readonly moveFieldUp: (field: BookingFieldRecord) => void;
  readonly moveFieldDown: (field: BookingFieldRecord) => void;
}

export interface ServiceDetailDialogState {
  readonly infoOpen: boolean;
  readonly itemOpen: boolean;
  readonly fieldOpen: boolean;
  readonly editingItem?: ServiceItemRecord;
  readonly editingField?: BookingFieldRecord;
  readonly deletingItem?: ServiceItemRecord;
  readonly deletingField?: BookingFieldRecord;
  readonly openEditInfo: () => void;
  readonly openAddItem: () => void;
  readonly openEditItem: (item: ServiceItemRecord) => void;
  readonly openAddField: () => void;
  readonly openEditField: (field: BookingFieldRecord) => void;
  readonly setInfoOpen: (open: boolean) => void;
  readonly setItemOpen: (open: boolean) => void;
  readonly setFieldOpen: (open: boolean) => void;
  readonly openDeleteItem: (item: ServiceItemRecord) => void;
  readonly openDeleteField: (field: BookingFieldRecord) => void;
  readonly closeDelete: () => void;
}

export interface ServiceDetailMutationHandlers {
  readonly moveItemUp: (item: ServiceItemRecord) => void;
  readonly moveItemDown: (item: ServiceItemRecord) => void;
  readonly moveFieldUp: (field: BookingFieldRecord) => void;
  readonly moveFieldDown: (field: BookingFieldRecord) => void;
}
