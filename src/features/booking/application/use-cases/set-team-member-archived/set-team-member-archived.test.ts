import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeTeamMemberRepository } from "../../../../../../tests/support/booking/fake-team-repositories";
import { addTeamMember } from "../add-team-member/add-team-member";
import { setTeamMemberArchived } from "./set-team-member-archived";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;
const ROLE = "6f1c1b0e-8a5d-4a43-a3b6-3c2f7c0f1a11";

async function seed() {
  const repository = new FakeTeamMemberRepository();
  repository.roles.set(ROLE, { workspaceId: "workspace-a", name: "Fotografer" });
  await addTeamMember(repository, context, "user-a", {
    name: "Dimas",
    whatsappNumber: "081298765432",
    email: "",
    roleIds: [ROLE],
  });
  return { repository, id: repository.rows[0]?.id ?? "" };
}

describe("setTeamMemberArchived", () => {
  it("AC-TEAM-007 archives and restores a member, repeating changes nothing", async () => {
    const { repository, id } = await seed();
    await setTeamMemberArchived(repository, context, "user-a", id, true);
    await setTeamMemberArchived(repository, context, "user-a", id, true);
    expect(repository.rows[0]?.archived).toBe(true);
    await setTeamMemberArchived(repository, context, "user-a", id, false);
    expect(repository.rows[0]?.archived).toBe(false);
  });

  it("AC-TEAM-022 throws not found for a member outside the workspace", async () => {
    const { repository, id } = await seed();
    await expect(
      setTeamMemberArchived(
        repository,
        { workspaceId: "workspace-b" } as unknown as WorkspaceContext,
        "user-b",
        id,
        true,
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
