import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeCategoryRepository } from "../../../../../../tests/support/booking/fake-category-repository";
import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import { deleteCategory } from "./delete-category";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;

describe("deleteCategory", () => {
  it("AC-CAT-018 deletes unused categories and guards categories with services", async () => {
    const repository = new FakeCategoryRepository();
    const unused = await repository.create(context, "Kosong", "user");
    const used = await repository.create(context, "Terpakai", "user");
    if (unused.status !== "CREATED" || used.status !== "CREATED") throw new Error("fixture");
    repository.servicesByCategory.set(used.id, { active: 1, archived: 0 });
    expect(await deleteCategory(repository, context, unused.id)).toEqual({ ok: true });
    expect(await deleteCategory(repository, context, used.id)).toEqual({
      ok: false,
      code: "IN_USE",
    });
  });

  it("throws NOT_FOUND for an unknown category", async () => {
    await expect(
      deleteCategory(new FakeCategoryRepository(), context, "missing"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" } satisfies Partial<CatalogError>);
  });
});
