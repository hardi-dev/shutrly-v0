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
    await seedDefaultItemDefinitions(repository, context, "id");
    await seedDefaultItemDefinitions(repository, context, "id");

    expect(repository.rows).toHaveLength(4);
    expect(repository.rows.find((row) => row.name === "foto edit")).toMatchObject({
      unit: "custom",
    });
  });

  it("D-18 an English owner gets the English names and units with the same keys", async () => {
    const repository = new FakeItemDefinitionRepository();
    await seedDefaultItemDefinitions(repository, context, "en");
    expect(
      repository.rows.map(({ name, unit, defaultKey }) => ({ name, unit, defaultKey })),
    ).toEqual([
      { name: "Edited photos", unit: "photos", defaultKey: "EDITED_PHOTOS" },
      { name: "Printed photos", unit: "prints", defaultKey: "PRINTED_PHOTOS" },
      { name: "Number of people", unit: "people", defaultKey: "PEOPLE_COUNT" },
      { name: "Shoot duration", unit: "hours", defaultKey: "SHOOT_DURATION" },
    ]);
  });
});
