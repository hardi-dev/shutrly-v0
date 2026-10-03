import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeClientRepository } from "../../../../../../tests/support/booking/fake-client-repository";
import { updateClient } from "./update-client";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;

describe("updateClient", () => {
  it("AC-CLI-012 replaces a client record and records the editor", async () => {
    const repository = new FakeClientRepository();
    await repository.create(context, {
      name: "Rina",
      whatsappNumber: null,
      socialLinks: [],
      editorUserId: "created-by",
    });
    const id = repository.rows[0]?.id;
    if (!id) throw new Error("fixture");

    await expect(
      updateClient(repository, context, id, "updated-by", {
        name: "Rina Wedding",
        whatsappNumber: "0812-3456-7890",
        socialLinks: [{ platform: "INSTAGRAM", value: "@rina.wed" }],
      }),
    ).resolves.toEqual({ ok: true });
    expect(repository.rows[0]).toMatchObject({
      name: "Rina Wedding",
      whatsappNumber: "6281234567890",
      socialLinks: [{ platform: "INSTAGRAM", value: "rina.wed" }],
      updatedBy: "updated-by",
    });
  });

  it("keeps its own number and reports another holder", async () => {
    const repository = new FakeClientRepository();
    await repository.create(context, {
      name: "Rina",
      whatsappNumber: null,
      socialLinks: [],
      editorUserId: "user",
    });
    await repository.create(context, {
      name: "Budi",
      whatsappNumber: null,
      socialLinks: [],
      editorUserId: "user",
    });
    const rina = repository.rows[0];
    const budi = repository.rows[1];

    await updateClient(repository, context, rina.id, "user", {
      name: "Rina",
      whatsappNumber: "0812-3456-7890",
      socialLinks: [],
    });
    await expect(
      updateClient(repository, context, rina.id, "user", {
        name: "Rina",
        whatsappNumber: "0812-3456-7890",
        socialLinks: [],
      }),
    ).resolves.toEqual({ ok: true });
    await expect(
      updateClient(repository, context, budi.id, "user", {
        name: "Budi",
        whatsappNumber: "0812-3456-7890",
        socialLinks: [],
      }),
    ).resolves.toMatchObject({ fieldErrors: { whatsappNumber: "TAKEN" } });
  });
});
