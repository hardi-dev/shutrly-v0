import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeItemDefinitionRepository } from "../../../../../../tests/support/booking/fake-item-definition-repository";
import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import { setItemDefinitionActive } from "./set-item-definition-active";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;

describe("setItemDefinitionActive", () => {
  it("AC-CAT-017 archives and unarchives a definition", async () => {
    const repository = new FakeItemDefinitionRepository();
    const created = await repository.create(context, {
      name: "Album",
      valueType: "NUMBER",
      unit: "buah",
      selectionRequired: false,
      pickMode: null,
      allowsPickNotes: false,
      editorUserId: "user",
    });
    expect(created).toBe("CREATED");
    const id = repository.rows[0]?.id;
    if (!id) throw new Error("fixture");
    await setItemDefinitionActive(repository, context, id, "user", false);
    expect(repository.rows[0]?.isActive).toBe(false);
    await setItemDefinitionActive(repository, context, id, "user", true);
    expect(repository.rows[0]?.isActive).toBe(true);
  });

  it("throws NOT_FOUND for an unknown definition", async () => {
    await expect(
      setItemDefinitionActive(
        new FakeItemDefinitionRepository(),
        context,
        "missing",
        "user",
        false,
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" } satisfies Partial<CatalogError>);
  });
});
