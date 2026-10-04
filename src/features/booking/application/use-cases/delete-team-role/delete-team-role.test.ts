import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeTeamRoleRepository } from "../../../../../../tests/support/booking/fake-team-repositories";
import { deleteTeamRole } from "./delete-team-role";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;

describe("deleteTeamRole", () => {
  it("AC-TEAM-009 deletes an unused role", async () => {
    const repository = new FakeTeamRoleRepository();
    await repository.seedDefaults(context, ["Asisten"]);
    await expect(deleteTeamRole(repository, context, repository.rows[0].id)).resolves.toEqual({
      ok: true,
    });
    expect(repository.rows).toHaveLength(0);
  });

  it("AC-TEAM-009 refuses a used role and reports the usage", async () => {
    const repository = new FakeTeamRoleRepository();
    await repository.seedDefaults(context, ["Fotografer"]);
    const { id } = repository.rows[0];
    repository.usage.set(id, 3);
    await expect(deleteTeamRole(repository, context, id)).resolves.toEqual({
      ok: false,
      code: "IN_USE",
      usage: 3,
    });
    expect(repository.rows).toHaveLength(1);
  });

  it("AC-TEAM-022 throws NOT_FOUND for a role outside the workspace", async () => {
    const repository = new FakeTeamRoleRepository();
    await expect(deleteTeamRole(repository, context, crypto.randomUUID())).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
