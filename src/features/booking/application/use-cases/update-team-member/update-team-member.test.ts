import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeTeamMemberRepository } from "../../../../../../tests/support/booking/fake-team-repositories";
import { addTeamMember } from "../add-team-member/add-team-member";
import { updateTeamMember } from "./update-team-member";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;
const PHOTOGRAPHER = "6f1c1b0e-8a5d-4a43-a3b6-3c2f7c0f1a11";
const VIDEOGRAPHER = "0b7d5c0c-2f7e-4a1b-9c7e-5a3c1f2d9e22";

async function seed() {
  const repository = new FakeTeamMemberRepository();
  repository.roles.set(PHOTOGRAPHER, { workspaceId: "workspace-a", name: "Fotografer" });
  repository.roles.set(VIDEOGRAPHER, { workspaceId: "workspace-a", name: "Videografer" });
  await addTeamMember(repository, context, "user-a", {
    name: "Dimas",
    whatsappNumber: "081298765432",
    email: "",
    roleIds: [PHOTOGRAPHER, VIDEOGRAPHER],
  });
  return { repository, id: repository.rows[0]?.id ?? "" };
}

describe("updateTeamMember", () => {
  it("AC-TEAM-007 replaces the roles", async () => {
    const { repository, id } = await seed();
    const result = await updateTeamMember(repository, context, "user-a", id, {
      name: "Dimas Pratama",
      whatsappNumber: "081298765432",
      email: "",
      roleIds: [PHOTOGRAPHER],
    });
    expect(result).toEqual({ ok: true });
    expect(repository.rows[0]).toMatchObject({ name: "Dimas Pratama", roleIds: [PHOTOGRAPHER] });
  });

  it("AC-TEAM-005 returns field errors and keeps the stored member", async () => {
    const { repository, id } = await seed();
    const result = await updateTeamMember(repository, context, "user-a", id, {
      name: "",
      whatsappNumber: "081298765432",
      email: "",
      roleIds: [PHOTOGRAPHER],
    });
    expect(result).toMatchObject({ ok: false, fieldErrors: { name: "EMPTY" } });
    expect(repository.rows[0]?.name).toBe("Dimas");
  });

  it("AC-TEAM-006 reports a number held by another member", async () => {
    const { repository, id } = await seed();
    await addTeamMember(repository, context, "user-a", {
      name: "Ayu",
      whatsappNumber: "081244102231",
      email: "",
      roleIds: [PHOTOGRAPHER],
    });
    const result = await updateTeamMember(repository, context, "user-a", id, {
      name: "Dimas",
      whatsappNumber: "081244102231",
      email: "",
      roleIds: [PHOTOGRAPHER],
    });
    expect(result).toMatchObject({
      ok: false,
      fieldErrors: { whatsappNumber: "TAKEN" },
      numberHolder: { name: "Ayu", isArchived: false },
    });
  });

  it("AC-TEAM-022 throws not found for an unknown member", async () => {
    const { repository } = await seed();
    await expect(
      updateTeamMember(repository, context, "user-a", crypto.randomUUID(), {
        name: "Dimas",
        whatsappNumber: "081298765432",
        email: "",
        roleIds: [PHOTOGRAPHER],
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
