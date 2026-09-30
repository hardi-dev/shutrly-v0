import { FakeWorkspaceRepository } from "@tests/support/workspace/fake-workspace-repository";
import { describe, expect, it } from "vitest";

import { createWorkspace } from "../create-workspace/create-workspace";
import { updateWorkspaceProfile } from "./update-workspace-profile";

describe("updateWorkspaceProfile", () => {
  it("AC-WS-017 normalises the prefix and updates only the verified row", async () => {
    const repository = new FakeWorkspaceRepository();
    const created = await createWorkspace(repository, "owner" as never, { name: "Aster" });
    await updateWorkspaceProfile(
      repository,
      { workspaceId: created.id },
      {
        name: "Aster Studio",
        brandName: "Aster",
        contactEmail: "owner@example.com",
        phone: "0812345678",
        address: "Jakarta",
        invoicePrefix: "as",
      },
    );
    expect(repository.records[0]).toMatchObject({ name: "Aster Studio", invoicePrefix: "AS" });
  });

  it("AC-WS-017 returns field error keys and saves nothing when input is invalid", async () => {
    const repository = new FakeWorkspaceRepository();
    const created = await createWorkspace(repository, "owner" as never, { name: "Aster" });
    const result = await updateWorkspaceProfile(
      repository,
      { workspaceId: created.id },
      { ...fields, contactEmail: "halo@aster", invoicePrefix: "A" },
    );
    expect(result).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { contactEmail: "email.invalid", invoicePrefix: "prefix.invalid" },
    });
    expect(repository.records[0]).toMatchObject({ name: "Aster" });
  });

  it("AC-WS-017 A-2 returns a name field error for another workspace's name", async () => {
    const repository = new FakeWorkspaceRepository();
    const created = await createWorkspace(repository, "owner" as never, { name: "Aster" });
    await createWorkspace(repository, "owner" as never, { name: "Bumi" });
    const result = await updateWorkspaceProfile(
      repository,
      { workspaceId: created.id },
      { ...fields, name: "bumi" },
    );
    expect(result).toEqual({
      ok: false,
      code: "DUPLICATE_NAME",
      fieldErrors: { name: "name.duplicate" },
    });
  });
});

const fields = {
  name: "Aster Studio",
  brandName: "",
  contactEmail: "",
  phone: "",
  address: "",
  invoicePrefix: "AS",
};
