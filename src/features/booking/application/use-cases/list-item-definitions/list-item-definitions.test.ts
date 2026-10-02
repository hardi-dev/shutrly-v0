import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeItemDefinitionRepository } from "../../../../../../tests/support/booking/fake-item-definition-repository";
import { listItemDefinitions } from "./list-item-definitions";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;

describe("listItemDefinitions", () => {
  it("AC-CAT-006 groups selection definitions before other definitions, sorted by name", async () => {
    const repository = new FakeItemDefinitionRepository();
    await repository.create(context, {
      name: "Foto z",
      valueType: "NUMBER",
      unit: "foto",
      selectionRequired: true,
      selectionType: "EDIT",
      editorUserId: "user",
    });
    await repository.create(context, {
      name: "Album",
      valueType: "NUMBER",
      unit: "buah",
      selectionRequired: false,
      selectionType: null,
      editorUserId: "user",
    });
    await repository.create(context, {
      name: "Foto a",
      valueType: "NUMBER",
      unit: "foto",
      selectionRequired: true,
      selectionType: "PRINT",
      editorUserId: "user",
    });

    const result = await listItemDefinitions(repository, context);
    expect(result.selection.map(({ name }) => name)).toEqual(["Foto a", "Foto z"]);
    expect(result.other.map(({ name }) => name)).toEqual(["Album"]);
  });
});
