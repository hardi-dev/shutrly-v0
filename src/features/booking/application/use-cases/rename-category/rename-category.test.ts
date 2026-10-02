import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeCategoryRepository } from "../../../../../../tests/support/booking/fake-category-repository";
import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import { addCategory } from "../add-category/add-category";
import { renameCategory } from "./rename-category";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;

describe("renameCategory", () => {
  it("AC-CAT-009 trims a category name", async () => {
    const repository = new FakeCategoryRepository();
    const created = await repository.create(context, "Lama", "user");
    if (created.status !== "CREATED") throw new Error("fixture");
    expect(
      await renameCategory(repository, context, created.id, "user", { name: "  Baru " }),
    ).toEqual({
      ok: true,
    });
    expect(repository.rows[0]?.name).toBe("Baru");
  });

  it("AC-CAT-019 maps duplicates and unknown IDs", async () => {
    const repository = new FakeCategoryRepository();
    await addCategory(repository, context, "user", { name: "Satu" });
    const second = await repository.create(context, "Dua", "user");
    if (second.status !== "CREATED") throw new Error("fixture");
    expect(await renameCategory(repository, context, second.id, "user", { name: "SATU" })).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { name: "NAME_TAKEN" },
    });
    await expect(
      renameCategory(repository, context, "missing", "user", { name: "Baru" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" } satisfies Partial<CatalogError>);
  });
});
