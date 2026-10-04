import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeTeamMemberRepository } from "../../../../../../tests/support/booking/fake-team-repositories";
import { addTeamMember } from "./add-team-member";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;
const ROLE = "6f1c1b0e-8a5d-4a43-a3b6-3c2f7c0f1a11";

function repositoryWithRole() {
  const repository = new FakeTeamMemberRepository();
  repository.roles.set(ROLE, { workspaceId: "workspace-a", name: "Fotografer" });
  return repository;
}

const valid = {
  name: "  Rina  ",
  whatsappNumber: "0812-3456-7890",
  email: "Rina@Example.com",
  roleIds: [ROLE, ROLE],
};

describe("addTeamMember", () => {
  it("AC-TEAM-004 stores the normalised member with its roles", async () => {
    const repository = repositoryWithRole();
    expect(await addTeamMember(repository, context, "user-a", valid)).toEqual({
      ok: true,
      member: { id: expect.any(String) as string, name: "Rina" },
    });
    expect(repository.rows[0]).toMatchObject({
      name: "Rina",
      whatsappNumber: "6281234567890",
      email: "rina@example.com",
      roleIds: [ROLE],
    });
  });

  it("AC-TEAM-005 collects every field error without storing", async () => {
    const repository = repositoryWithRole();
    const result = await addTeamMember(repository, context, "user-a", {
      name: " ",
      whatsappNumber: "",
      email: "rina@",
      roleIds: [],
    });
    expect(result).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: {
        name: "EMPTY",
        whatsappNumber: "REQUIRED",
        email: "INVALID",
        roleIds: "REQUIRED",
      },
    });
    expect(repository.rows).toHaveLength(0);
  });

  it("AC-TEAM-005 reports a number that is not valid as INVALID", async () => {
    const result = await addTeamMember(repositoryWithRole(), context, "user-a", {
      ...valid,
      whatsappNumber: "12345",
    });
    expect(result).toMatchObject({ ok: false, fieldErrors: { whatsappNumber: "INVALID" } });
  });

  it("AC-TEAM-006 reports the holder of a taken number, archived or not", async () => {
    const repository = repositoryWithRole();
    await addTeamMember(repository, context, "user-a", valid);
    const second = await addTeamMember(repository, context, "user-a", { ...valid, name: "Budi" });
    expect(second).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { whatsappNumber: "TAKEN" },
      numberHolder: { name: "Rina", isArchived: false },
    });
  });

  it("TD-A-5 throws not found for a role outside the workspace", async () => {
    const repository = new FakeTeamMemberRepository();
    await expect(addTeamMember(repository, context, "user-a", valid)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
