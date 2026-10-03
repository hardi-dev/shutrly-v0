import {
  seedAssignment,
  seedClientAndService,
  seedProjectWithSession,
  seedTeamRoles,
  seedTeamWorkspace,
  type TeamSeedBase,
} from "@tests/support/booking/team-seed";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleProjectListReader } from "@/adapters/db/project-repository/drizzle-project-list-reader";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";
import { project } from "@/adapters/db/schema/booking/project";
import { sessionAssignment, teamMember, teamRole } from "@/adapters/db/schema/booking/team";
import { createDrizzleSessionAssignmentRepository } from "@/adapters/db/team-repository/drizzle-session-assignment-repository";
import { createDrizzleTeamMemberRepository } from "@/adapters/db/team-repository/drizzle-team-member-repository";
import { teamMemberInputSchema } from "@/features/booking/application/schemas/team-member-input/team-member-input.schema";
import { isTeamEditable } from "@/features/booking/domain/session-assignment/session-assignment";

import { openTestDb } from "../helpers/test-db";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

const DIMAS = "6281298765432";
const BUDI = "6281111111111";

async function createMember(base: TeamSeedBase, name: string, number: string, roleIds: string[]) {
  const parsed = teamMemberInputSchema.parse({ name, whatsappNumber: number, email: "", roleIds });
  const result = await createDrizzleTeamMemberRepository(db).create(base, {
    ...parsed,
    editorUserId: base.ownerId,
  });
  if (typeof result === "string" || result.status !== "CREATED") throw new Error("member fixture");
  return result.id;
}

function add(
  base: TeamSeedBase,
  target: { projectId: string; sessionId: string },
  memberId: string,
  roleId: string,
) {
  return createDrizzleSessionAssignmentRepository(db).add(base, {
    ...target,
    memberId,
    roleId,
    actorId: base.ownerId,
    isEditable: isTeamEditable,
  });
}

function remove(base: TeamSeedBase, projectId: string, assignmentId: string) {
  return createDrizzleSessionAssignmentRepository(db).remove(base, {
    projectId,
    assignmentId,
    isEditable: isTeamEditable,
  });
}

async function fixture() {
  const base = await seedTeamWorkspace(db);
  const roles = await seedTeamRoles(db, base, ["Fotografer", "Videografer", "Asisten"]);
  const dimas = await createMember(base, "Dimas Pratama", DIMAS, [
    roles.Fotografer,
    roles.Videografer,
  ]);
  const target = await seedProjectWithSession(db, base);
  return { base, roles, dimas, target };
}

describe("Drizzle session assignment repository", () => {
  it("AC-TEAM-011 AC-TEAM-021 adds an assignment and leaves the project status alone", async () => {
    const { base, roles, dimas, target } = await fixture();
    expect(await add(base, target, dimas, roles.Videografer)).toBe("ADDED");
    const rows = await db
      .select()
      .from(sessionAssignment)
      .where(eq(sessionAssignment.sessionId, target.sessionId));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      memberId: dimas,
      roleId: roles.Videografer,
      updatedBy: base.ownerId,
    });
    const [row] = await db
      .select({ status: project.status })
      .from(project)
      .where(eq(project.id, target.projectId));
    expect(row.status).toBe("BOOKED");
  });

  it("AC-TEAM-013 refuses the same member twice, one by one and in parallel", async () => {
    const { base, roles, dimas, target } = await fixture();
    expect(await add(base, target, dimas, roles.Fotografer)).toBe("ADDED");
    expect(await add(base, target, dimas, roles.Videografer)).toBe("ALREADY_ASSIGNED");

    const second = await seedProjectWithSession(db, base);
    const results = await Promise.all([
      add(base, second, dimas, roles.Fotografer),
      add(base, second, dimas, roles.Videografer),
    ]);
    expect(results.toSorted((a, b) => a.localeCompare(b))).toEqual(["ADDED", "ALREADY_ASSIGNED"]);
    const rows = await db
      .select()
      .from(sessionAssignment)
      .where(eq(sessionAssignment.sessionId, second.sessionId));
    expect(rows).toHaveLength(1);
  });

  it("AC-TEAM-013 refuses an archived member and a role the member does not hold", async () => {
    const { base, roles, dimas, target } = await fixture();
    const budi = await createMember(base, "Budi Hartono", BUDI, [roles.Asisten]);
    await db.update(teamMember).set({ archivedAt: new Date() }).where(eq(teamMember.id, budi));
    expect(await add(base, target, budi, roles.Asisten)).toBe("MEMBER_ARCHIVED");
    expect(await add(base, target, dimas, roles.Asisten)).toBe("ROLE_NOT_HELD");
    expect(
      await db
        .select()
        .from(sessionAssignment)
        .where(eq(sessionAssignment.sessionId, target.sessionId)),
    ).toEqual([]);
  });

  it("AC-TEAM-013 does not find a session of another project through this project's route", async () => {
    const { base, roles, dimas, target } = await fixture();
    const other = await seedProjectWithSession(db, base);
    expect(
      await add(
        base,
        { projectId: target.projectId, sessionId: other.sessionId },
        dimas,
        roles.Fotografer,
      ),
    ).toBe("NOT_FOUND");
    expect(
      await add(
        base,
        { projectId: crypto.randomUUID(), sessionId: target.sessionId },
        dimas,
        roles.Fotografer,
      ),
    ).toBe("NOT_FOUND");
  });

  it("AC-TEAM-015 refuses to staff a cancelled project", async () => {
    const { base, roles, dimas } = await fixture();
    const cancelled = await seedProjectWithSession(db, base, "CANCELLED");
    expect(await add(base, cancelled, dimas, roles.Fotografer)).toBe("PROJECT_CANCELLED");
  });

  it("AC-TEAM-022 does not find another workspace's member, role, session or project", async () => {
    const first = await fixture();
    const second = await fixture();
    const { base, target } = first;
    expect(await add(base, target, second.dimas, first.roles.Fotografer)).toBe("NOT_FOUND");
    expect(await add(base, target, first.dimas, second.roles.Fotografer)).toBe("NOT_FOUND");
    expect(await add(base, second.target, first.dimas, first.roles.Fotografer)).toBe("NOT_FOUND");
    expect(
      await db
        .select()
        .from(sessionAssignment)
        .where(eq(sessionAssignment.workspaceId, base.workspaceId)),
    ).toEqual([]);
  });

  it("AC-TEAM-011 lists only active members with their roles by name for the form", async () => {
    const { base, roles } = await fixture();
    const ayu = await createMember(base, "Ayu Kirana", "6281244102231", [roles.Asisten]);
    const budi = await createMember(base, "Budi Hartono", BUDI, [roles.Asisten]);
    await db.update(teamMember).set({ archivedAt: new Date() }).where(eq(teamMember.id, budi));
    const list = await createDrizzleTeamMemberRepository(db).listAssignable(base);
    expect(list.map((member) => member.name)).toEqual(["Ayu Kirana", "Dimas Pratama"]);
    expect(list[0]?.id).toBe(ayu);
    expect(list[1]?.roles.map((role) => role.name)).toEqual(["Fotografer", "Videografer"]);
  });
});

describe("project detail and list with a team", () => {
  it("AC-TEAM-026 loads assignments in creation order with the archived flag and the current role name", async () => {
    const { base, roles, dimas, target } = await fixture();
    const sari = await createMember(base, "Sari Lestari", "6281222222222", [roles.Asisten]);
    expect(await add(base, target, sari, roles.Asisten)).toBe("ADDED");
    expect(await add(base, target, dimas, roles.Videografer)).toBe("ADDED");
    await db.update(teamMember).set({ archivedAt: new Date() }).where(eq(teamMember.id, sari));
    await db
      .update(teamRole)
      .set({ name: "Asisten lapangan" })
      .where(eq(teamRole.id, roles.Asisten));

    const detail = await createDrizzleProjectRepository(db).findDetail(base, target.projectId);
    expect(detail?.assignments.map((a) => [a.memberName, a.roleName, a.isMemberArchived])).toEqual([
      ["Sari Lestari", "Asisten lapangan", true],
      ["Dimas Pratama", "Videografer", false],
    ]);
    expect(detail?.assignments.every((a) => a.sessionId === target.sessionId)).toBe(true);
  });

  it("AC-TEAM-022 never loads another workspace's assignments", async () => {
    const first = await fixture();
    const second = await fixture();
    await add(second.base, second.target, second.dimas, second.roles.Fotografer);
    const detail = await createDrizzleProjectRepository(db).findDetail(
      first.base,
      first.target.projectId,
    );
    expect(detail?.assignments).toEqual([]);
    expect(
      await createDrizzleProjectRepository(db).findDetail(first.base, second.target.projectId),
    ).toBeNull();
  });

  it("AC-TEAM-020 marks a listed project as having a team only once someone is assigned", async () => {
    const { base, roles, dimas, target } = await fixture();
    const reader = createDrizzleProjectListReader(db);
    const query = {
      tab: "ACTIVE",
      search: null,
      filter: null,
      afterId: null,
      limit: 50,
      today: "2026-10-04",
    } as const;
    const before = (await reader.listPage(base, query)).find((row) => row.id === target.projectId);
    expect(before?.hasTeam).toBe(false);
    await add(base, target, dimas, roles.Fotografer);
    const after = (await reader.listPage(base, query)).find((row) => row.id === target.projectId);
    expect(after?.hasTeam).toBe(true);
  });
});

describe("removing an assignment", () => {
  it("AC-TEAM-014 removes the assignment and keeps the member and the session", async () => {
    const { base, roles, dimas, target } = await fixture();
    const id = await seedAssignment(db, base, target, dimas, roles.Fotografer);
    expect(await remove(base, target.projectId, id)).toBe("REMOVED");
    expect(await db.select().from(sessionAssignment).where(eq(sessionAssignment.id, id))).toEqual(
      [],
    );
    expect(await db.select().from(teamMember).where(eq(teamMember.id, dimas))).toHaveLength(1);
    expect(await remove(base, target.projectId, id)).toBe("NOT_FOUND");
  });

  it("AC-TEAM-014 lets the member be added again, in another role", async () => {
    const { base, roles, dimas, target } = await fixture();
    const id = await seedAssignment(db, base, target, dimas, roles.Fotografer);
    expect(await remove(base, target.projectId, id)).toBe("REMOVED");
    expect(await add(base, target, dimas, roles.Videografer)).toBe("ADDED");
  });

  it("AC-TEAM-015 refuses to remove from a cancelled project and keeps the row", async () => {
    const { base, roles, dimas } = await fixture();
    const target = await seedProjectWithSession(db, base);
    const id = await seedAssignment(db, base, target, dimas, roles.Fotografer);
    await createDrizzleProjectRepository(db).withLockedProject(base, target.projectId, (_l, w) =>
      w.cancel({ reason: null, actorId: base.ownerId }),
    );
    expect(await remove(base, target.projectId, id)).toBe("PROJECT_CANCELLED");
    expect(await add(base, target, dimas, roles.Videografer)).toBe("PROJECT_CANCELLED");
    expect(
      await db.select().from(sessionAssignment).where(eq(sessionAssignment.id, id)),
    ).toHaveLength(1);
  });

  it("AC-TEAM-015 serialises a cancel and an add: the add lands first or is refused", async () => {
    const { base, roles, dimas, target } = await fixture();
    const [, added] = await Promise.all([
      createDrizzleProjectRepository(db).withLockedProject(base, target.projectId, (_l, w) =>
        w.cancel({ reason: null, actorId: base.ownerId }),
      ),
      add(base, target, dimas, roles.Fotografer),
    ]);
    expect(["ADDED", "PROJECT_CANCELLED"]).toContain(added);
    const rows = await db
      .select()
      .from(sessionAssignment)
      .where(eq(sessionAssignment.sessionId, target.sessionId));
    expect(rows).toHaveLength(added === "ADDED" ? 1 : 0);
    const [row] = await db.select().from(project).where(eq(project.id, target.projectId));
    expect(row.status).toBe("CANCELLED");
  });

  it("AC-TEAM-022 does not find another workspace's assignment, by route or by id", async () => {
    const first = await fixture();
    const second = await fixture();
    const theirs = await seedAssignment(
      db,
      second.base,
      second.target,
      second.dimas,
      second.roles.Fotografer,
    );
    expect(await remove(first.base, second.target.projectId, theirs)).toBe("NOT_FOUND");
    expect(await remove(first.base, first.target.projectId, theirs)).toBe("NOT_FOUND");
    expect(
      await db.select().from(sessionAssignment).where(eq(sessionAssignment.id, theirs)),
    ).toHaveLength(1);
  });

  it("AC-TEAM-022 does not find an assignment through another project's route", async () => {
    const { base, roles, dimas, target } = await fixture();
    const other = await seedProjectWithSession(db, base);
    const id = await seedAssignment(db, base, target, dimas, roles.Fotografer);
    expect(await remove(base, other.projectId, id)).toBe("NOT_FOUND");
  });
});

describe("deleting a session or a draft with a team", () => {
  it("AC-TEAM-020 removes the assignments with the session and keeps the members", async () => {
    const { base, roles, dimas, target } = await fixture();
    const id = await seedAssignment(db, base, target, dimas, roles.Fotografer);
    const removed = await createDrizzleProjectRepository(db).withLockedProject(
      base,
      target.projectId,
      (_l, w) => w.deleteSession(target.sessionId),
    );
    expect(removed).toBe(true);
    expect(await db.select().from(sessionAssignment).where(eq(sessionAssignment.id, id))).toEqual(
      [],
    );
    expect(await db.select().from(teamMember).where(eq(teamMember.id, dimas))).toHaveLength(1);
  });

  it("AC-TEAM-020 removes the assignments with a deleted draft and keeps the members", async () => {
    const { base, roles, dimas, target } = await fixture();
    const id = await seedAssignment(db, base, target, dimas, roles.Fotografer);
    await createDrizzleProjectRepository(db).withLockedProject(base, target.projectId, (_l, w) =>
      w.deleteProject(),
    );
    expect(await db.select().from(sessionAssignment).where(eq(sessionAssignment.id, id))).toEqual(
      [],
    );
    expect(await db.select().from(teamMember).where(eq(teamMember.id, dimas))).toHaveLength(1);
  });
});

describe("tenant isolation of the team reads", () => {
  it("AC-TEAM-022 lists only the workspace's own members as assignable", async () => {
    const first = await fixture();
    const second = await fixture();
    const own = await createDrizzleTeamMemberRepository(db).listAssignable(first.base);
    expect(own.map((member) => member.id)).toEqual([first.dimas]);
    const theirs = await createDrizzleTeamMemberRepository(db).listAssignable(second.base);
    expect(theirs.map((member) => member.id)).toEqual([second.dimas]);
  });

  it("AC-TEAM-022 never lists or flags another workspace's project in the project list", async () => {
    const first = await fixture();
    const second = await fixture();
    await add(second.base, second.target, second.dimas, second.roles.Fotografer);
    const query = {
      tab: "ACTIVE",
      search: null,
      filter: null,
      afterId: null,
      limit: 50,
      today: "2026-10-04",
    } as const;
    const rows = await createDrizzleProjectListReader(db).listPage(first.base, query);
    expect(rows.map((row) => row.id)).toEqual([first.target.projectId]);
    expect(rows[0]?.hasTeam).toBe(false);
  });

  it("AC-TEAM-022 gives another workspace's member no role in this workspace's assignments", async () => {
    const first = await fixture();
    const second = await fixture();
    expect(await add(first.base, first.target, second.dimas, second.roles.Fotografer)).toBe(
      "NOT_FOUND",
    );
    expect(await remove(first.base, first.target.projectId, crypto.randomUUID())).toBe("NOT_FOUND");
  });
});

const SESSIONS = [
  { name: "Akad", date: "2026-11-10", startTime: null, endTime: null, location: null },
  { name: "Resepsi", date: "2026-11-11", startTime: null, endTime: null, location: null },
];

async function snapshotFor(
  base: TeamSeedBase,
  sessions: ReadonlyArray<
    (typeof SESSIONS)[number] & { team: { memberId: string; roleId: string }[] }
  >,
) {
  const { clientId, serviceId } = await seedClientAndService(db, base);
  return createDrizzleProjectRepository(db).createSnapshot(base, {
    status: "BOOKED",
    clientId,
    serviceId,
    title: "Wisuda Rina",
    notes: null,
    agreedPrice: "750000",
    accessToken: Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url"),
    actorId: base.ownerId,
    items: [],
    fieldValues: {},
    sessions,
  });
}

describe("creating a project with a team", () => {
  it("AC-TEAM-028 stores each session's team with the project, in one transaction", async () => {
    const { base, roles, dimas } = await fixture();
    const sari = await createMember(base, "Sari Lestari", "6281222222222", [roles.Asisten]);
    const result = await snapshotFor(base, [
      { ...SESSIONS[0], team: [{ memberId: dimas, roleId: roles.Videografer }] },
      {
        ...SESSIONS[1],
        team: [
          { memberId: sari, roleId: roles.Asisten },
          { memberId: dimas, roleId: roles.Fotografer },
        ],
      },
    ]);
    if (result.status !== "CREATED") throw new Error("not created");
    const detail = await createDrizzleProjectRepository(db).findDetail(base, result.id);
    const bySession = new Map(detail?.sessions.map((s) => [s.id, s.name]));
    const rows = (detail?.assignments ?? []).map((a) => [
      bySession.get(a.sessionId),
      a.memberName,
      a.roleName,
    ]);
    expect(rows).toEqual([
      ["Akad", "Dimas Pratama", "Videografer"],
      ["Resepsi", "Sari Lestari", "Asisten"],
      ["Resepsi", "Dimas Pratama", "Fotografer"],
    ]);
    expect(detail?.status).toBe("BOOKED");
  });

  it("AC-TEAM-028 refuses an archived member or a role the member lacks and writes nothing", async () => {
    const { base, roles, dimas, target } = await fixture();
    const archived = await createMember(base, "Budi Hartono", BUDI, [roles.Asisten]);
    await db.update(teamMember).set({ archivedAt: new Date() }).where(eq(teamMember.id, archived));
    expect(
      await snapshotFor(base, [
        { ...SESSIONS[0], team: [] },
        { ...SESSIONS[1], team: [{ memberId: archived, roleId: roles.Asisten }] },
      ]),
    ).toEqual({ status: "TEAM_INVALID", sessionIndex: 1 });
    expect(
      await snapshotFor(base, [
        { ...SESSIONS[0], team: [{ memberId: dimas, roleId: roles.Asisten }] },
      ]),
    ).toEqual({ status: "TEAM_INVALID", sessionIndex: 0 });
    const rows = await db.select().from(project).where(eq(project.workspaceId, base.workspaceId));
    // Only the project the fixture seeded exists: the refused creations rolled back.
    expect(rows.map((row) => row.id)).toEqual([target.projectId]);
  });

  it("AC-TEAM-022 does not find another workspace's member or role", async () => {
    const first = await fixture();
    const second = await fixture();
    expect(
      await snapshotFor(first.base, [
        { ...SESSIONS[0], team: [{ memberId: second.dimas, roleId: first.roles.Fotografer }] },
      ]),
    ).toEqual({ status: "NOT_FOUND" });
    expect(
      await snapshotFor(first.base, [
        { ...SESSIONS[0], team: [{ memberId: first.dimas, roleId: second.roles.Fotografer }] },
      ]),
    ).toEqual({ status: "NOT_FOUND" });
  });
});
