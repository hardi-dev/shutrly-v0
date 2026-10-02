import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeCategoryRepository } from "./fake-category-repository";
import { FakeItemDefinitionRepository } from "./fake-item-definition-repository";
import { FakeServiceRepository } from "./fake-service-repository";

export const bookingContext = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;
export const categoryId = "00000000-0000-4000-8000-000000000001";

export const serviceInput = {
  name: "Wisuda Basic",
  categoryId,
  basePrice: "750.000",
};

export async function serviceFixture() {
  const categories = new FakeCategoryRepository();
  const definitions = new FakeItemDefinitionRepository();
  const services = new FakeServiceRepository(categories, definitions);
  const category = await categories.create(bookingContext, "Wisuda", "user");
  if (category.status !== "CREATED") throw new Error("category fixture");
  categories.rows[0] = { ...categories.rows[0], id: categoryId };
  await definitions.create(bookingContext, {
    name: "Foto edit",
    valueType: "NUMBER",
    unit: "foto",
    selectionRequired: true,
    selectionType: "EDIT",
    editorUserId: "user",
  });
  await definitions.create(bookingContext, {
    name: "Foto cetak",
    valueType: "NUMBER",
    unit: "lembar",
    selectionRequired: true,
    selectionType: "PRINT",
    editorUserId: "user",
  });
  await definitions.create(bookingContext, {
    name: "Jumlah orang",
    valueType: "RANGE",
    unit: "orang",
    selectionRequired: false,
    selectionType: null,
    editorUserId: "user",
  });
  const service = await services.create(bookingContext, {
    name: "Wisuda Basic",
    categoryId,
    basePrice: "750000",
    editorUserId: "user",
  });
  if (service.status !== "CREATED") throw new Error("service fixture");
  return { categories, definitions, services, serviceId: service.id };
}
