import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeItemDefinitionRepository } from "../../../../../../tests/support/booking/fake-item-definition-repository";
import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import { updateItemDefinition } from "./update-item-definition";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;
const input = {
  name: "Album",
  valueType: "NUMBER" as const,
  unit: "buah",
  selectionRequired: false,
  selectionType: null,
  editorUserId: "user",
};

describe("updateItemDefinition", () => {
  it("AC-CAT-008 allows rename and unit changes while used, but locks type changes", async () => {
    const repository = new FakeItemDefinitionRepository();
    await repository.create(context, input);
    const id = repository.rows[0]?.id;
    if (!id) throw new Error("fixture");
    repository.usage.set(id, 1);
    expect(
      await updateItemDefinition(repository, context, id, "user", {
        ...input,
        name: "Album baru",
        unit: "set",
      }),
    ).toEqual({ ok: true });
    expect(
      await updateItemDefinition(repository, context, id, "user", {
        ...input,
        name: "Album baru",
        unit: "set",
        valueType: "RANGE",
      }),
    ).toEqual({ ok: false, code: "VALIDATION_FAILED", fieldErrors: { valueType: "LOCKED" } });
  });

  it("allows an unused definition type change and throws for an unknown ID", async () => {
    const repository = new FakeItemDefinitionRepository();
    await repository.create(context, input);
    const id = repository.rows[0]?.id;
    if (!id) throw new Error("fixture");
    expect(
      await updateItemDefinition(repository, context, id, "user", {
        ...input,
        valueType: "RANGE",
        selectionRequired: false,
      }),
    ).toEqual({ ok: true });
    await expect(
      updateItemDefinition(repository, context, "missing", "user", input),
    ).rejects.toMatchObject({ code: "NOT_FOUND" } satisfies Partial<CatalogError>);
  });
});
