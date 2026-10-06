import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeItemDefinitionRepository } from "../../../../../../tests/support/booking/fake-item-definition-repository";
import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import { deleteItemDefinition } from "./delete-item-definition";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;

describe("deleteItemDefinition", () => {
  it("AC-CAT-018 guards used definitions and deletes unused definitions", async () => {
    const repository = new FakeItemDefinitionRepository();
    await repository.create(context, {
      name: "Foto edit",
      valueType: "NUMBER",
      unit: "foto",
      selectionRequired: true,
      pickMode: "COUNT",
      allowsPickNotes: true,
      editorUserId: "user",
    });
    await repository.create(context, {
      name: "Album",
      valueType: "NUMBER",
      unit: "buah",
      selectionRequired: false,
      pickMode: null,
      allowsPickNotes: false,
      editorUserId: "user",
    });
    const usedId = repository.rows[0]?.id;
    const unusedId = repository.rows[1]?.id;
    if (!usedId || !unusedId) throw new Error("fixture");
    repository.usage.set(usedId, 1);
    expect(await deleteItemDefinition(repository, context, usedId)).toEqual({
      ok: false,
      code: "IN_USE",
    });
    expect(await deleteItemDefinition(repository, context, unusedId)).toEqual({ ok: true });
  });

  it("throws NOT_FOUND for an unknown definition", async () => {
    await expect(
      deleteItemDefinition(new FakeItemDefinitionRepository(), context, "missing"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" } satisfies Partial<CatalogError>);
  });
});
