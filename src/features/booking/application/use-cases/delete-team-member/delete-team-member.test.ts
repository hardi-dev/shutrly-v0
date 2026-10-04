import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeTeamMemberRepository } from "../../../../../../tests/support/booking/fake-team-repositories";
import { addTeamMember } from "../add-team-member/add-team-member";
import { deleteTeamMember } from "./delete-team-member";

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

describe("deleteTeamMember", () => {
  it("AC-TEAM-007 deletes a member without assignments", async () => {
    const { repository, id } = await seed();
    expect(await deleteTeamMember(repository, context, id)).toEqual({ ok: true });
    expect(repository.rows).toHaveLength(0);
  });

  it("AC-TEAM-007 reports HAS_ASSIGNMENTS and keeps a member that is assigned", async () => {
    const { repository, id } = await seed();
    repository.assigned.add(id);
    expect(await deleteTeamMember(repository, context, id)).toEqual({
      ok: false,
      code: "HAS_ASSIGNMENTS",
    });
    expect(repository.rows).toHaveLength(1);
  });

  it("AC-TEAM-022 throws not found for an unknown member", async () => {
    const { repository } = await seed();
    await expect(deleteTeamMember(repository, context, crypto.randomUUID())).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
