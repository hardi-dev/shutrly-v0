import "server-only";

import { notFound } from "next/navigation";

import { getRequestFormattingLocale } from "@/composition/locale/request-formatting-locale/request-formatting-locale";
import { CatalogError } from "@/features/booking/application/errors/catalog-errors/catalog-errors";
import { catalogIdSchema } from "@/features/booking/application/schemas/catalog-id/catalog-id.schema";
import { addBookingField } from "@/features/booking/application/use-cases/add-booking-field/add-booking-field";
import { addCategory } from "@/features/booking/application/use-cases/add-category/add-category";
import { addItemDefinition } from "@/features/booking/application/use-cases/add-item-definition/add-item-definition";
import { addService } from "@/features/booking/application/use-cases/add-service/add-service";
import { addServiceItem } from "@/features/booking/application/use-cases/add-service-item/add-service-item";
import { deleteCategory } from "@/features/booking/application/use-cases/delete-category/delete-category";
import { deleteItemDefinition } from "@/features/booking/application/use-cases/delete-item-definition/delete-item-definition";
import { deleteService } from "@/features/booking/application/use-cases/delete-service/delete-service";
import { getServiceDetail } from "@/features/booking/application/use-cases/get-service-detail/get-service-detail";
import { listCategories } from "@/features/booking/application/use-cases/list-categories/list-categories";
import { listItemDefinitions } from "@/features/booking/application/use-cases/list-item-definitions/list-item-definitions";
import { listServices } from "@/features/booking/application/use-cases/list-services/list-services";
import { moveBookingField } from "@/features/booking/application/use-cases/move-booking-field/move-booking-field";
import { moveServiceItem } from "@/features/booking/application/use-cases/move-service-item/move-service-item";
import { removeBookingField } from "@/features/booking/application/use-cases/remove-booking-field/remove-booking-field";
import { removeServiceItem } from "@/features/booking/application/use-cases/remove-service-item/remove-service-item";
import { renameCategory } from "@/features/booking/application/use-cases/rename-category/rename-category";
import { setCategoryActive } from "@/features/booking/application/use-cases/set-category-active/set-category-active";
import { setItemDefinitionActive } from "@/features/booking/application/use-cases/set-item-definition-active/set-item-definition-active";
import { setServiceActive } from "@/features/booking/application/use-cases/set-service-active/set-service-active";
import { updateBookingField } from "@/features/booking/application/use-cases/update-booking-field/update-booking-field";
import { updateItemDefinition } from "@/features/booking/application/use-cases/update-item-definition/update-item-definition";
import { updateServiceInfo } from "@/features/booking/application/use-cases/update-service-info/update-service-info";
import { updateServiceItemValue } from "@/features/booking/application/use-cases/update-service-item-value/update-service-item-value";
import { DomainError } from "@/shared/errors/domain-error";
import { logger } from "@/shared/logging/logger";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import { withCatalogScope } from "../catalog-scope/catalog-scope";
import type {
  CategoriesData,
  ItemDefinitionsData,
  ServiceDetailData,
  ServicesData,
} from "./catalog-flow.types";

type CatalogKind = "category" | "definition" | "service";

function idOrNotFound(rawId: string): string {
  const parsed = catalogIdSchema.safeParse(rawId);
  if (!parsed.success) notFound();
  return parsed.data;
}

function saveError(
  error: unknown,
  details: {
    readonly workspaceId: string;
    readonly entity: string;
    readonly entityId?: string;
    readonly operation: string;
  },
): never {
  if (error instanceof CatalogError && error.code === "NOT_FOUND") notFound();
  if (!(error instanceof DomainError)) logger.error("catalog.save_failed", details);
  throw new CatalogError("SAVE_FAILED");
}

export async function loadServices(rawWorkspaceId: string): Promise<ServicesData> {
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  const locale = await getRequestFormattingLocale();
  try {
    return await withCatalogScope(({ services, categories }) =>
      listServices(services, categories, verified.context, locale),
    );
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "service",
      operation: "list",
    });
  }
}

export async function loadCategories(rawWorkspaceId: string): Promise<CategoriesData> {
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withCatalogScope(({ categories }) => listCategories(categories, verified.context));
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "category",
      operation: "list",
    });
  }
}

export async function loadItemDefinitions(rawWorkspaceId: string): Promise<ItemDefinitionsData> {
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withCatalogScope(({ itemDefinitions }) =>
      listItemDefinitions(itemDefinitions, verified.context),
    );
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "definition",
      operation: "list",
    });
  }
}

export async function loadServiceDetail(
  rawWorkspaceId: string,
  rawServiceId: string,
): Promise<ServiceDetailData> {
  const serviceId = idOrNotFound(rawServiceId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  const locale = await getRequestFormattingLocale();
  try {
    return await withCatalogScope(({ services }) =>
      getServiceDetail(services, verified.context, serviceId, locale),
    );
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "service",
      entityId: serviceId,
      operation: "detail",
    });
  }
}

export async function addCatalogCategory(rawWorkspaceId: string, input: unknown) {
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withCatalogScope(({ categories }) =>
      addCategory(categories, verified.context, account.id, input),
    );
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "category",
      operation: "add",
    });
  }
}

export async function renameCatalogCategory(rawWorkspaceId: string, rawId: string, input: unknown) {
  const id = idOrNotFound(rawId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withCatalogScope(({ categories }) =>
      renameCategory(categories, verified.context, id, account.id, input),
    );
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "category",
      entityId: id,
      operation: "rename",
    });
  }
}

export async function addCatalogItemDefinition(rawWorkspaceId: string, input: unknown) {
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withCatalogScope(({ itemDefinitions }) =>
      addItemDefinition(itemDefinitions, verified.context, account.id, input),
    );
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "definition",
      operation: "add",
    });
  }
}

export async function updateCatalogItemDefinition(
  rawWorkspaceId: string,
  rawId: string,
  input: unknown,
) {
  const id = idOrNotFound(rawId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withCatalogScope(({ itemDefinitions }) =>
      updateItemDefinition(itemDefinitions, verified.context, id, account.id, input),
    );
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "definition",
      entityId: id,
      operation: "update",
    });
  }
}

export async function addCatalogService(rawWorkspaceId: string, input: unknown) {
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  const locale = await getRequestFormattingLocale();
  try {
    return await withCatalogScope(({ services }) =>
      addService(services, verified.context, account.id, input, locale),
    );
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "service",
      operation: "add",
    });
  }
}

export async function updateCatalogServiceInfo(
  rawWorkspaceId: string,
  rawId: string,
  input: unknown,
) {
  const id = idOrNotFound(rawId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  const locale = await getRequestFormattingLocale();
  try {
    return await withCatalogScope(({ services }) =>
      updateServiceInfo(services, verified.context, id, account.id, input, locale),
    );
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "service",
      entityId: id,
      operation: "update_info",
    });
  }
}

export async function setCatalogActive(
  rawWorkspaceId: string,
  kind: CatalogKind,
  rawId: string,
  isActive: boolean,
): Promise<void> {
  const id = idOrNotFound(rawId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    await withCatalogScope(async ({ categories, itemDefinitions, services }) => {
      if (kind === "category")
        await setCategoryActive(categories, verified.context, id, account.id, isActive);
      else if (kind === "definition")
        await setItemDefinitionActive(itemDefinitions, verified.context, id, account.id, isActive);
      else await setServiceActive(services, verified.context, id, account.id, isActive);
    });
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: kind,
      entityId: id,
      operation: "set_active",
    });
  }
}

export async function deleteCatalogEntry(rawWorkspaceId: string, kind: CatalogKind, rawId: string) {
  const id = idOrNotFound(rawId);
  await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withCatalogScope(({ categories, itemDefinitions, services }) => {
      if (kind === "category") return deleteCategory(categories, verified.context, id);
      if (kind === "definition") return deleteItemDefinition(itemDefinitions, verified.context, id);
      return deleteService(services, verified.context, id);
    });
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: kind,
      entityId: id,
      operation: "delete",
    });
  }
}

export async function addCatalogServiceItem(
  rawWorkspaceId: string,
  rawServiceId: string,
  input: { readonly definitionId: string; readonly value: unknown },
) {
  const serviceId = idOrNotFound(rawServiceId);
  const definitionId = idOrNotFound(input.definitionId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withCatalogScope(({ services, itemDefinitions }) =>
      addServiceItem(
        services,
        itemDefinitions,
        verified.context,
        serviceId,
        definitionId,
        account.id,
        input.value,
      ),
    );
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "service_item",
      entityId: serviceId,
      operation: "add",
    });
  }
}

export async function updateCatalogServiceItem(
  rawWorkspaceId: string,
  rawServiceId: string,
  rawItemId: string,
  input: { readonly value: unknown },
) {
  const serviceId = idOrNotFound(rawServiceId);
  const itemId = idOrNotFound(rawItemId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withCatalogScope(async ({ services, itemDefinitions }) => {
      const detail = await services.findDetail(verified.context, serviceId);
      const item = detail?.items.find((candidate) => candidate.id === itemId);
      if (!item) throw new CatalogError("NOT_FOUND");
      return updateServiceItemValue(
        services,
        itemDefinitions,
        verified.context,
        serviceId,
        itemId,
        item.definitionId,
        account.id,
        input.value,
      );
    });
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "service_item",
      entityId: itemId,
      operation: "update",
    });
  }
}

export async function removeCatalogServiceItem(
  rawWorkspaceId: string,
  rawServiceId: string,
  rawItemId: string,
) {
  const serviceId = idOrNotFound(rawServiceId);
  const itemId = idOrNotFound(rawItemId);
  await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withCatalogScope(({ services }) =>
      removeServiceItem(services, verified.context, serviceId, itemId),
    );
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "service_item",
      entityId: itemId,
      operation: "delete",
    });
  }
}

export async function moveCatalogServiceItem(
  rawWorkspaceId: string,
  rawServiceId: string,
  rawItemId: string,
  direction: unknown,
) {
  const serviceId = idOrNotFound(rawServiceId);
  const itemId = idOrNotFound(rawItemId);
  await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withCatalogScope(({ services }) =>
      moveServiceItem(services, verified.context, serviceId, itemId, direction),
    );
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "service_item",
      entityId: itemId,
      operation: "move",
    });
  }
}

export async function addCatalogBookingField(
  rawWorkspaceId: string,
  rawServiceId: string,
  input: unknown,
) {
  const serviceId = idOrNotFound(rawServiceId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withCatalogScope(({ services }) =>
      addBookingField(services, verified.context, serviceId, account.id, input),
    );
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "booking_field",
      entityId: serviceId,
      operation: "add",
    });
  }
}

export async function updateCatalogBookingField(
  rawWorkspaceId: string,
  rawServiceId: string,
  rawFieldId: string,
  input: unknown,
) {
  const serviceId = idOrNotFound(rawServiceId);
  const fieldId = idOrNotFound(rawFieldId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withCatalogScope(({ services }) =>
      updateBookingField(services, verified.context, serviceId, fieldId, account.id, input),
    );
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "booking_field",
      entityId: fieldId,
      operation: "update",
    });
  }
}

export async function removeCatalogBookingField(
  rawWorkspaceId: string,
  rawServiceId: string,
  rawFieldId: string,
) {
  const serviceId = idOrNotFound(rawServiceId);
  const fieldId = idOrNotFound(rawFieldId);
  await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withCatalogScope(({ services }) =>
      removeBookingField(services, verified.context, serviceId, fieldId),
    );
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "booking_field",
      entityId: fieldId,
      operation: "delete",
    });
  }
}

export async function moveCatalogBookingField(
  rawWorkspaceId: string,
  rawServiceId: string,
  rawFieldId: string,
  direction: unknown,
) {
  const serviceId = idOrNotFound(rawServiceId);
  const fieldId = idOrNotFound(rawFieldId);
  await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withCatalogScope(({ services }) =>
      moveBookingField(services, verified.context, serviceId, fieldId, direction),
    );
  } catch (error) {
    return saveError(error, {
      workspaceId: verified.context.workspaceId,
      entity: "booking_field",
      entityId: fieldId,
      operation: "move",
    });
  }
}
