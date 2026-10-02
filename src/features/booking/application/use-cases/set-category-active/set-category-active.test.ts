import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeCategoryRepository } from "../../../../../../tests/support/booking/fake-category-repository";
import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import { setCategoryActive } from "./set-category-active";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;

describe("setCategoryActive", () => {
  it("AC-CAT-017 archives and unarchives a category", async () => {
    const repository = new FakeCategoryRepository();
    const created = await repository.create(context, "Wisuda", "user");
    if (created.status !== "CREATED") throw new Error("fixture");
    await setCategoryActive(repository, context, created.id, "user", false);
    expect(repository.rows[0]?.isActive).toBe(false);
    await setCategoryActive(repository, context, created.id, "user", true);
    expect(repository.rows[0]?.isActive).toBe(true);
  });

  it("throws NOT_FOUND for an unknown category", async () => {
    await expect(
      setCategoryActive(new FakeCategoryRepository(), context, "missing", "user", false),
    ).rejects.toMatchObject({ code: "NOT_FOUND" } satisfies Partial<CatalogError>);
  });
});
