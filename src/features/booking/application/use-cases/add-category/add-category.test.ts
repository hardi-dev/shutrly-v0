import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeCategoryRepository } from "../../../../../../tests/support/booking/fake-category-repository";
import { addCategory } from "./add-category";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;

describe("addCategory", () => {
  it("AC-CAT-009 trims the name and rejects case-insensitive duplicates", async () => {
    const repository = new FakeCategoryRepository();
    expect(await addCategory(repository, context, "user", { name: "  Wisuda  " })).toEqual({
      ok: true,
    });
    expect(await addCategory(repository, context, "user", { name: "wisuda" })).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { name: "NAME_TAKEN" },
    });
    expect(repository.rows[0]?.name).toBe("Wisuda");
  });
});
