import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeItemDefinitionRepository } from "../../../../../../tests/support/booking/fake-item-definition-repository";
import { addItemDefinition } from "./add-item-definition";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;
const valid = {
  name: "Album",
  valueType: "NUMBER" as const,
  unit: "buah",
  selectionRequired: false,
  selectionType: null,
};

describe("addItemDefinition", () => {
  it("AC-CAT-006 adds a non-selection definition", async () => {
    const repository = new FakeItemDefinitionRepository();
    expect(await addItemDefinition(repository, context, "user", valid)).toEqual({ ok: true });
    expect(repository.rows[0]).toMatchObject(valid);
  });

  it("AC-CAT-007 maps invalid type rules and AC-CAT-019 maps duplicates", async () => {
    const repository = new FakeItemDefinitionRepository();
    expect(
      await addItemDefinition(repository, context, "user", {
        ...valid,
        valueType: "RANGE",
        selectionRequired: true,
        selectionType: "EDIT",
      }),
    ).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { valueType: "SELECTION_NEEDS_NUMBER" },
    });
    await addItemDefinition(repository, context, "user", valid);
    expect(
      await addItemDefinition(repository, context, "user", { ...valid, name: "album" }),
    ).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { name: "NAME_TAKEN" },
    });
  });
});
