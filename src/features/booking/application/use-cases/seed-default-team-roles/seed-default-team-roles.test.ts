import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeTeamRoleRepository } from "../../../../../../tests/support/booking/fake-team-repositories";
import { seedDefaultTeamRoles } from "./seed-default-team-roles";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;

describe("seedDefaultTeamRoles", () => {
  it("AC-TEAM-008 seeds Fotografer, Videografer and Asisten once", async () => {
    const repository = new FakeTeamRoleRepository();
    await seedDefaultTeamRoles(repository, context);
    await seedDefaultTeamRoles(repository, context);
    expect(repository.rows.map((row) => row.name)).toEqual([
      "Fotografer",
      "Videografer",
      "Asisten",
    ]);
  });

  it("AC-TEAM-008 keeps an existing role whatever its case", async () => {
    const repository = new FakeTeamRoleRepository();
    repository.rows.push({ id: "r1", workspaceId: "workspace-a", name: "fotografer" });
    await seedDefaultTeamRoles(repository, context);
    expect(repository.rows.map((row) => row.name)).toEqual([
      "fotografer",
      "Videografer",
      "Asisten",
    ]);
  });
});
