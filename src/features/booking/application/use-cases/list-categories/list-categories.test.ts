import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeCategoryRepository } from "../../../../../../tests/support/booking/fake-category-repository";
import { listCategories } from "./list-categories";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;

describe("listCategories", () => {
  it("AC-CAT-009 returns active categories first with service counts", async () => {
    const repository = new FakeCategoryRepository();
    const archived = await repository.create(context, "Wisuda Lama", "user");
    const active = await repository.create(context, "Wisuda Basic", "user");
    if (archived.status !== "CREATED" || active.status !== "CREATED") throw new Error("fixture");
    repository.rows[0] = { ...repository.rows[0], isActive: false };
    repository.servicesByCategory.set(active.id, { active: 2, archived: 1 });

    const result = await listCategories(repository, context);

    expect(result.map(({ name }) => name)).toEqual(["Wisuda Basic", "Wisuda Lama"]);
    expect(result[0]).toMatchObject({ serviceCount: 2, archivedServiceCount: 1 });
  });
});
