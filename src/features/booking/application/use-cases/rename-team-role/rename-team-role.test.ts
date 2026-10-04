import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeTeamRoleRepository } from "../../../../../../tests/support/booking/fake-team-repositories";
import { renameTeamRole } from "./rename-team-role";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;

async function seeded() {
  const repository = new FakeTeamRoleRepository();
  await repository.seedDefaults(context, ["Fotografer", "Videografer"]);
  const [first] = repository.rows;
  return { repository, id: first.id };
}

describe("renameTeamRole", () => {
  it("AC-TEAM-009 renames the role", async () => {
    const { repository, id } = await seeded();
    await expect(
      renameTeamRole(repository, context, id, "owner", { name: "Fotografer Utama" }),
    ).resolves.toEqual({ ok: true });
    expect(repository.rows[0].name).toBe("Fotografer Utama");
  });

  it("AC-TEAM-009 keeps the role when only its case changes", async () => {
    const { repository, id } = await seeded();
    await expect(
      renameTeamRole(repository, context, id, "owner", { name: "fotografer" }),
    ).resolves.toEqual({ ok: true });
  });

  it("AC-TEAM-009 reports another role's name", async () => {
    const { repository, id } = await seeded();
    await expect(
      renameTeamRole(repository, context, id, "owner", { name: "VIDEOGRAFER" }),
    ).resolves.toMatchObject({ fieldErrors: { name: "DUPLICATE" } });
  });

  it("AC-TEAM-022 throws NOT_FOUND for a role outside the workspace", async () => {
    const { repository } = await seeded();
    await expect(
      renameTeamRole(repository, context, crypto.randomUUID(), "owner", { name: "Editor" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
