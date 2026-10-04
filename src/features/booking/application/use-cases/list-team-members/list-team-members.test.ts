import { describe, expect, it } from "vitest";

import { TEAM_PAGE_SIZE } from "@/features/booking/domain/team-member/team-member";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeTeamMemberRepository } from "../../../../../../tests/support/booking/fake-team-repositories";
import { addTeamMember } from "../add-team-member/add-team-member";
import { countTeamMembers } from "../count-team-members/count-team-members";
import { listTeamMembers } from "./list-team-members";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;
const ROLE = "6f1c1b0e-8a5d-4a43-a3b6-3c2f7c0f1a11";

async function seed(total: number) {
  const repository = new FakeTeamMemberRepository();
  repository.roles.set(ROLE, { workspaceId: "workspace-a", name: "Fotografer" });
  for (let index = 0; index < total; index += 1) {
    await addTeamMember(repository, context, "user-a", {
      name: `Anggota ${String(index).padStart(3, "0")}`,
      whatsappNumber: `62812000${String(index).padStart(4, "0")}`,
      email: "",
      roleIds: [ROLE],
    });
  }
  return repository;
}

describe("listTeamMembers", () => {
  it("AC-TEAM-003 pages 65 members as 30, 30 and 5 with a cursor", async () => {
    const repository = await seed(65);
    const first = await listTeamMembers(repository, context, {
      status: "ACTIVE",
      q: "",
      afterId: null,
    });
    expect(first.items).toHaveLength(TEAM_PAGE_SIZE);
    expect(first.nextCursor).toBe(first.items.at(-1)?.id);
    const second = await listTeamMembers(repository, context, {
      status: "ACTIVE",
      q: "",
      afterId: first.nextCursor,
    });
    const third = await listTeamMembers(repository, context, {
      status: "ACTIVE",
      q: "",
      afterId: second.nextCursor,
    });
    expect([second.items.length, third.items.length, third.nextCursor]).toEqual([30, 5, null]);
  });

  it("AC-TEAM-003 passes a search and ignores a blank one", async () => {
    const repository = await seed(3);
    const found = await listTeamMembers(repository, context, {
      status: "ACTIVE",
      q: "anggota 001",
      afterId: null,
    });
    expect(found.items.map((member) => member.name)).toEqual(["Anggota 001"]);
    const blank = await listTeamMembers(repository, context, {
      status: "ACTIVE",
      q: "  ",
      afterId: null,
    });
    expect(blank.items).toHaveLength(3);
  });

  it("AC-TEAM-001 counts by status", async () => {
    const repository = await seed(2);
    expect(await countTeamMembers(repository, context, "ACTIVE")).toBe(2);
    expect(await countTeamMembers(repository, context, "ARCHIVED")).toBe(0);
  });
});
