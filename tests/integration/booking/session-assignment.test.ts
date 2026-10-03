import {
  seedProjectWithSession,
  seedTeamRoles,
  seedTeamWorkspace,
  type TeamSeedBase,
} from "@tests/support/booking/team-seed";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { project } from "@/adapters/db/schema/booking/project";
import { sessionAssignment, teamMember } from "@/adapters/db/schema/booking/team";
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
