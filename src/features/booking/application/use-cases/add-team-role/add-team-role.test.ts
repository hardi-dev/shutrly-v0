import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeTeamRoleRepository } from "../../../../../../tests/support/booking/fake-team-repositories";
import { addTeamRole } from "./add-team-role";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;

describe("addTeamRole", () => {
  it("BR-TEAM-005 stores the trimmed name and returns the role", async () => {
    const repository = new FakeTeamRoleRepository();
    const result = await addTeamRole(repository, context, "owner", { name: "  Editor  " });
    expect(result).toEqual({
      ok: true,
      role: { id: expect.any(String) as string, name: "Editor" },
    });
    expect(repository.rows.map((row) => row.name)).toEqual(["Editor"]);
  });

  it("AC-TEAM-009 reports a name another role has, ignoring case", async () => {
    const repository = new FakeTeamRoleRepository();
    await repository.seedDefaults(context, ["Videografer"]);
    await expect(
      addTeamRole(repository, context, "owner", { name: "videografer" }),
    ).resolves.toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { name: "DUPLICATE" },
    });
  });

  it("BR-TEAM-005 returns EMPTY and TOO_LONG without storing", async () => {
    const repository = new FakeTeamRoleRepository();
    await expect(addTeamRole(repository, context, "owner", { name: "  " })).resolves.toMatchObject({
      fieldErrors: { name: "EMPTY" },
    });
    await expect(
      addTeamRole(repository, context, "owner", { name: "a".repeat(51) }),
    ).resolves.toMatchObject({ fieldErrors: { name: "TOO_LONG" } });
    expect(repository.rows).toHaveLength(0);
  });
});
