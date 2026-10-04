import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeTeamRoleRepository } from "../../../../../../tests/support/booking/fake-team-repositories";
import { listTeamRoles } from "./list-team-roles";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;
const other = { workspaceId: "workspace-b" } as unknown as WorkspaceContext;

describe("listTeamRoles", () => {
  it("AC-TEAM-008 AC-TEAM-009 lists the workspace's roles by name with their usage", async () => {
    const repository = new FakeTeamRoleRepository();
    await repository.seedDefaults(context, ["Videografer", "Asisten"]);
    await repository.seedDefaults(other, ["Fotografer"]);
    repository.usage.set(repository.rows[0].id, 2);
    expect(await listTeamRoles(repository, context)).toEqual([
      { id: expect.any(String) as string, name: "Asisten", usage: 0 },
      { id: expect.any(String) as string, name: "Videografer", usage: 2 },
    ]);
  });
});
