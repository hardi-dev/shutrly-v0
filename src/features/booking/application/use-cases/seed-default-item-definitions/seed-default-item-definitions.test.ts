import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeItemDefinitionRepository } from "../../../../../../tests/support/booking/fake-item-definition-repository";
import { seedDefaultItemDefinitions } from "./seed-default-item-definitions";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;

describe("seedDefaultItemDefinitions", () => {
  it("AC-CAT-001 seeds four definitions, is idempotent, and keeps an existing Foto edit", async () => {
    const repository = new FakeItemDefinitionRepository();
    await repository.create(context, {
      name: "foto edit",
      valueType: "NUMBER",
      unit: "custom",
      selectionRequired: true,
      pickMode: "COUNT",
      allowsPickNotes: true,
      editorUserId: "owner",
    });
    await seedDefaultItemDefinitions(repository, context);
    await seedDefaultItemDefinitions(repository, context);

    expect(repository.rows).toHaveLength(4);
    expect(repository.rows.find((row) => row.name === "foto edit")).toMatchObject({
      unit: "custom",
    });
  });
});
