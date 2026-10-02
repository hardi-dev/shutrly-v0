"use server";

import { revalidatePath } from "next/cache";

import {
  addCatalogBookingField,
  addCatalogCategory,
  addCatalogItemDefinition,
  addCatalogService,
  addCatalogServiceItem,
  deleteCatalogEntry,
  moveCatalogBookingField,
  moveCatalogServiceItem,
  removeCatalogBookingField,
  removeCatalogServiceItem,
  renameCatalogCategory,
  setCatalogActive,
  updateCatalogBookingField,
  updateCatalogItemDefinition,
  updateCatalogServiceInfo,
  updateCatalogServiceItem,
} from "@/composition/booking/catalog-flow/catalog-flow";

const PAGE = "/w/[workspaceId]/services";

function revalidateCatalog(): void {
  revalidatePath(PAGE, "layout");
}

export async function addCategoryAction(workspaceId: string, values: unknown) {
  const result = await addCatalogCategory(workspaceId, values);
  if (result.ok) revalidateCatalog();
  return result.ok ? undefined : result;
}

export async function renameCategoryAction(
  workspaceId: string,
  categoryId: string,
  values: unknown,
) {
  const result = await renameCatalogCategory(workspaceId, categoryId, values);
  if (result.ok) revalidateCatalog();
  return result.ok ? undefined : result;
}

export async function addItemDefinitionAction(workspaceId: string, values: unknown) {
  const result = await addCatalogItemDefinition(workspaceId, values);
  if (result.ok) revalidateCatalog();
  return result.ok ? undefined : result;
}

export async function updateItemDefinitionAction(
  workspaceId: string,
  definitionId: string,
  values: unknown,
) {
  const result = await updateCatalogItemDefinition(workspaceId, definitionId, values);
  if (result.ok) revalidateCatalog();
  return result.ok ? undefined : result;
}

export async function addServiceAction(workspaceId: string, values: unknown) {
  const result = await addCatalogService(workspaceId, values);
  if (result.ok) revalidateCatalog();
  return result;
}

export async function updateServiceInfoAction(
  workspaceId: string,
  serviceId: string,
  values: unknown,
) {
  const result = await updateCatalogServiceInfo(workspaceId, serviceId, values);
  if (result.ok) revalidateCatalog();
  return result.ok ? undefined : result;
}

export async function setCatalogActiveAction(
  workspaceId: string,
  kind: "category" | "definition" | "service",
  id: string,
  isActive: boolean,
): Promise<void> {
  await setCatalogActive(workspaceId, kind, id, isActive);
  revalidateCatalog();
}

export async function deleteCatalogEntryAction(
  workspaceId: string,
  kind: "category" | "definition" | "service",
  id: string,
) {
  const result = await deleteCatalogEntry(workspaceId, kind, id);
  if (result.ok) revalidateCatalog();
  return result;
}

export async function addServiceItemAction(
  workspaceId: string,
  serviceId: string,
  values: { readonly definitionId: string; readonly value: unknown },
) {
  const result = await addCatalogServiceItem(workspaceId, serviceId, values);
  if (result.ok) revalidateCatalog();
  return result.ok ? undefined : result;
}

export async function updateServiceItemAction(
  workspaceId: string,
  serviceId: string,
  itemId: string,
  values: { readonly value: unknown },
) {
  const result = await updateCatalogServiceItem(workspaceId, serviceId, itemId, values);
  if (result.ok) revalidateCatalog();
  return result.ok ? undefined : result;
}

export async function removeServiceItemAction(
  workspaceId: string,
  serviceId: string,
  itemId: string,
) {
  await removeCatalogServiceItem(workspaceId, serviceId, itemId);
  revalidateCatalog();
}

export async function moveServiceItemAction(
  workspaceId: string,
  serviceId: string,
  itemId: string,
  direction: unknown,
) {
  const result = await moveCatalogServiceItem(workspaceId, serviceId, itemId, direction);
  if (result.ok) revalidateCatalog();
  return result.ok ? undefined : result;
}

export async function addBookingFieldAction(
  workspaceId: string,
  serviceId: string,
  values: unknown,
) {
  const result = await addCatalogBookingField(workspaceId, serviceId, values);
  if (result.ok) revalidateCatalog();
  return result.ok ? undefined : result;
}

export async function updateBookingFieldAction(
  workspaceId: string,
  serviceId: string,
  fieldId: string,
  values: unknown,
) {
  const result = await updateCatalogBookingField(workspaceId, serviceId, fieldId, values);
  if (result.ok) revalidateCatalog();
  return result.ok ? undefined : result;
}

export async function removeBookingFieldAction(
  workspaceId: string,
  serviceId: string,
  fieldId: string,
) {
  await removeCatalogBookingField(workspaceId, serviceId, fieldId);
  revalidateCatalog();
}

export async function moveBookingFieldAction(
  workspaceId: string,
  serviceId: string,
  fieldId: string,
  direction: unknown,
) {
  const result = await moveCatalogBookingField(workspaceId, serviceId, fieldId, direction);
  if (result.ok) revalidateCatalog();
  return result.ok ? undefined : result;
}
