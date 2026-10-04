import {
  seedAssignment,
  seedProjectWithSession,
  seedTeamRoles,
  seedTeamWorkspace,
  type TeamSeedBase,
} from "@tests/support/booking/team-seed";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { client } from "@/adapters/db/schema/booking/client";
import { sessionAssignment, teamMember, teamMemberRole } from "@/adapters/db/schema/booking/team";
import { createDrizzleTeamMemberRepository } from "@/adapters/db/team-repository/drizzle-team-member-repository";
import type { TeamMemberChange } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import { teamMemberInputSchema } from "@/features/booking/application/schemas/team-member-input/team-member-input.schema";
import { clientSearchSchema } from "@/features/booking/domain/client-search/client-search.schema";

import { openTestDb } from "../helpers/test-db";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

const DIMAS = "6281298765432";
const AYU = "6281244102231";
const BUDI = "6281111111111";

function change(
  base: TeamSeedBase,
  fields: { name: string; number: string; roleIds: string[]; email?: string },
): TeamMemberChange {
  const parsed = teamMemberInputSchema.parse({
    name: fields.name,
    whatsappNumber: fields.number,
    email: fields.email ?? "",
    roleIds: fields.roleIds,
  });
  return { ...parsed, editorUserId: base.ownerId };
}

async function createMember(
  base: TeamSeedBase,
  fields: Parameters<typeof change>[1],
): Promise<string> {
  const result = await createDrizzleTeamMemberRepository(db).create(base, change(base, fields));
  if (typeof result === "string" || result.status !== "CREATED") throw new Error("member fixture");
  return result.id;
}

function page(
  base: TeamSeedBase,
  query: { status?: "ACTIVE" | "ARCHIVED"; q?: string; afterId?: string | null; limit?: number },
) {
  return createDrizzleTeamMemberRepository(db).listPage(base, {
    status: query.status ?? "ACTIVE",
    search: clientSearchSchema.safeParse(query.q ?? "").data ?? null,
    afterId: query.afterId ?? null,
    limit: query.limit ?? 31,
  });
}

describe("Drizzle team member repository", () => {
  it("AC-TEAM-001 lists active members by name with their roles and counts per tab", async () => {
    const base = await seedTeamWorkspace(db);
    const roles = await seedTeamRoles(db, base, ["Fotografer", "Videografer", "Asisten"]);
    await createMember(base, {
      name: "Dimas Pratama",
      number: DIMAS,
      roleIds: [roles.Videografer, roles.Fotografer],
    });
    await createMember(base, { name: "Ayu Kirana", number: AYU, roleIds: [roles.Asisten] });
    const budi = await createMember(base, {
      name: "Budi Hartono",
      number: BUDI,
      roleIds: [roles.Asisten],
    });
    await db.update(teamMember).set({ archivedAt: new Date() }).where(eq(teamMember.id, budi));

    const active = await page(base, {});
    expect(active.map((member) => member.name)).toEqual(["Ayu Kirana", "Dimas Pratama"]);
    expect(active[1]?.roles.map((role) => role.name)).toEqual(["Fotografer", "Videografer"]);
    const repository = createDrizzleTeamMemberRepository(db);
    expect(await repository.count(base, "ACTIVE")).toBe(2);
    expect((await page(base, { status: "ARCHIVED" })).map((member) => member.name)).toEqual([
      "Budi Hartono",
    ]);
    expect(await repository.count(base, "ARCHIVED")).toBe(1);
  });

  it("AC-TEAM-003 searches by name, by number digits and escapes LIKE wildcards", async () => {
    const base = await seedTeamWorkspace(db);
    const roles = await seedTeamRoles(db, base, ["Fotografer"]);
    await createMember(base, { name: "Dimas Pratama", number: DIMAS, roleIds: [roles.Fotografer] });
    await createMember(base, { name: "Ayu 100% Kirana", number: AYU, roleIds: [roles.Fotografer] });

    expect((await page(base, { q: "DIM" })).map((member) => member.name)).toEqual([
      "Dimas Pratama",
    ]);
    expect((await page(base, { q: "0812 9876" })).map((member) => member.name)).toEqual([
      "Dimas Pratama",
    ]);
    expect((await page(base, { q: "%" })).map((member) => member.name)).toEqual([
      "Ayu 100% Kirana",
    ]);
    expect(await page(base, { q: "zzz" })).toEqual([]);
  });

  it("AC-TEAM-003 pages 65 members as 30, 30 and 5 and keeps the count apart", async () => {
    const base = await seedTeamWorkspace(db);
    const roles = await seedTeamRoles(db, base, ["Fotografer"]);
    for (let index = 0; index < 65; index += 1) {
      await createMember(base, {
        name: `Anggota ${String(index).padStart(3, "0")}`,
        number: `62812000${String(index).padStart(4, "0")}`,
        roleIds: [roles.Fotografer],
      });
    }
    const sizes: number[] = [];
    let afterId: string | null = null;
    for (;;) {
      const rows = await page(base, { afterId, limit: 30 });
      sizes.push(rows.length);
      if (rows.length < 30) break;
      afterId = rows.at(-1)?.id ?? null;
    }
    expect(sizes).toEqual([30, 30, 5]);
    expect(await createDrizzleTeamMemberRepository(db).count(base, "ACTIVE")).toBe(65);
  });

  it("AC-TEAM-004 stores the number, the lower-case email and the roles", async () => {
    const base = await seedTeamWorkspace(db);
    const roles = await seedTeamRoles(db, base, ["Fotografer", "Videografer"]);
    await createMember(base, {
      name: "  Rina  ",
      number: "0812-9876-5432",
      email: "Rina@Example.com",
      roleIds: [roles.Fotografer, roles.Videografer, roles.Fotografer],
    });
    const [member] = await page(base, {});
    expect(member).toMatchObject({
      name: "Rina",
      whatsappNumber: DIMAS,
      email: "rina@example.com",
      isArchived: false,
    });
    expect(member.roles).toHaveLength(2);
  });

  it("AC-TEAM-006 refuses a number held by an archived member but not by a client", async () => {
    const base = await seedTeamWorkspace(db);
    const roles = await seedTeamRoles(db, base, ["Fotografer"]);
    const repository = createDrizzleTeamMemberRepository(db);
    const budi = await createMember(base, {
      name: "Budi Hartono",
      number: BUDI,
      roleIds: [roles.Fotografer],
    });
    await db.update(teamMember).set({ archivedAt: new Date() }).where(eq(teamMember.id, budi));
    expect(
      await repository.create(
        base,
        change(base, { name: "Budi Baru", number: BUDI, roleIds: [roles.Fotografer] }),
      ),
    ).toEqual({ status: "NUMBER_TAKEN", holder: { name: "Budi Hartono", isArchived: true } });

    await db
      .insert(client)
      .values({ workspaceId: base.workspaceId, name: "Klien", whatsappNumber: AYU });
    await expect(
      createMember(base, { name: "Ayu Kirana", number: AYU, roleIds: [roles.Fotografer] }),
    ).resolves.toBeTypeOf("string");
  });

  it("AC-TEAM-006 lets exactly one of two parallel creates take a number", async () => {
    const base = await seedTeamWorkspace(db);
    const roles = await seedTeamRoles(db, base, ["Fotografer"]);
    const repository = createDrizzleTeamMemberRepository(db);
    const results = await Promise.all([
      repository.create(
        base,
        change(base, { name: "Satu", number: DIMAS, roleIds: [roles.Fotografer] }),
      ),
      repository.create(
        base,
        change(base, { name: "Dua", number: DIMAS, roleIds: [roles.Fotografer] }),
      ),
    ]);
    const statuses = results.map((result) => (typeof result === "string" ? result : result.status));
    expect(statuses.toSorted((a, b) => a.localeCompare(b))).toEqual(["CREATED", "NUMBER_TAKEN"]);
  });

  it("AC-TEAM-006 lets a member keep its own number and refuses another member's", async () => {
    const base = await seedTeamWorkspace(db);
    const roles = await seedTeamRoles(db, base, ["Fotografer"]);
    const repository = createDrizzleTeamMemberRepository(db);
    const dimas = await createMember(base, {
      name: "Dimas",
      number: DIMAS,
      roleIds: [roles.Fotografer],
    });
    await createMember(base, { name: "Ayu", number: AYU, roleIds: [roles.Fotografer] });
    expect(
      await repository.update(
        base,
        dimas,
        change(base, { name: "Dimas P", number: DIMAS, roleIds: [roles.Fotografer] }),
      ),
    ).toBe("UPDATED");
    expect(
      await repository.update(
        base,
        dimas,
        change(base, { name: "Dimas", number: AYU, roleIds: [roles.Fotografer] }),
      ),
    ).toEqual({
      status: "NUMBER_TAKEN",
      holder: { name: "Ayu", isArchived: false },
    });
  });

  it("AC-TEAM-007 removing a role from a member leaves its assignment's role", async () => {
    const base = await seedTeamWorkspace(db);
    const roles = await seedTeamRoles(db, base, ["Fotografer", "Videografer"]);
    const repository = createDrizzleTeamMemberRepository(db);
    const dimas = await createMember(base, {
      name: "Dimas",
      number: DIMAS,
      roleIds: [roles.Fotografer, roles.Videografer],
    });
    const target = await seedProjectWithSession(db, base);
    const assignmentId = await seedAssignment(db, base, target, dimas, roles.Videografer);

    expect(
      await repository.update(
        base,
        dimas,
        change(base, { name: "Dimas", number: DIMAS, roleIds: [roles.Fotografer] }),
      ),
    ).toBe("UPDATED");
    const [kept] = await db
      .select({ roleId: sessionAssignment.roleId })
      .from(sessionAssignment)
      .where(eq(sessionAssignment.id, assignmentId));
    expect(kept.roleId).toBe(roles.Videografer);
    expect((await page(base, {}))[0]?.roles.map((role) => role.name)).toEqual(["Fotografer"]);
  });

  it("TD-A-5 returns NOT_FOUND for a role of another workspace and stores nothing", async () => {
    const base = await seedTeamWorkspace(db);
    const other = await seedTeamWorkspace(db);
    const foreign = await seedTeamRoles(db, other, ["Fotografer"]);
    const repository = createDrizzleTeamMemberRepository(db);
    expect(
      await repository.create(
        base,
        change(base, { name: "Dimas", number: DIMAS, roleIds: [foreign.Fotografer] }),
      ),
    ).toBe("NOT_FOUND");
    expect(await page(base, {})).toEqual([]);
    const own = await seedTeamRoles(db, base, ["Fotografer"]);
    const dimas = await createMember(base, {
      name: "Dimas",
      number: DIMAS,
      roleIds: [own.Fotografer],
    });
    expect(
      await repository.update(
        base,
        dimas,
        change(base, { name: "Dimas", number: DIMAS, roleIds: [foreign.Fotografer] }),
      ),
    ).toBe("NOT_FOUND");
  });

  it("AC-TEAM-022 never reads or updates another workspace's member", async () => {
    const first = await seedTeamWorkspace(db);
    const second = await seedTeamWorkspace(db);
    const roles = await seedTeamRoles(db, second, ["Fotografer"]);
    const repository = createDrizzleTeamMemberRepository(db);
    const foreign = await createMember(second, {
      name: "Rahasia",
      number: DIMAS,
      roleIds: [roles.Fotografer],
    });
    expect(await page(first, {})).toEqual([]);
    expect(await repository.count(first, "ACTIVE")).toBe(0);
    const ownRoles = await seedTeamRoles(db, first, ["Fotografer"]);
    expect(
      await repository.update(
        first,
        foreign,
        change(first, { name: "Dicuri", number: AYU, roleIds: [ownRoles.Fotografer] }),
      ),
    ).toBe("NOT_FOUND");
    expect((await page(second, {}))[0]?.name).toBe("Rahasia");
  });

  it("AC-TEAM-007 archives, restores and keeps the first archive time when repeated", async () => {
    const base = await seedTeamWorkspace(db);
    const roles = await seedTeamRoles(db, base, ["Fotografer"]);
    const repository = createDrizzleTeamMemberRepository(db);
    const dimas = await createMember(base, {
      name: "Dimas",
      number: DIMAS,
      roleIds: [roles.Fotografer],
    });
    const change = { id: dimas, editorUserId: base.ownerId };
    expect(await repository.setArchived(base, { ...change, isArchived: true })).toBe(true);
    const [first] = await db
      .select({ at: teamMember.archivedAt })
      .from(teamMember)
      .where(eq(teamMember.id, dimas));
    await repository.setArchived(base, { ...change, isArchived: true });
    const [second] = await db
      .select({ at: teamMember.archivedAt })
      .from(teamMember)
      .where(eq(teamMember.id, dimas));
    expect(second.at).toEqual(first.at);
    expect((await page(base, { status: "ARCHIVED" })).map((member) => member.name)).toEqual([
      "Dimas",
    ]);
    expect(await repository.setArchived(base, { ...change, isArchived: false })).toBe(true);
    expect((await page(base, {})).map((member) => member.name)).toEqual(["Dimas"]);
  });

  it("AC-TEAM-007 refuses to delete an assigned member and deletes an unassigned one with its role rows", async () => {
    const base = await seedTeamWorkspace(db);
    const roles = await seedTeamRoles(db, base, ["Fotografer"]);
    const repository = createDrizzleTeamMemberRepository(db);
    const assigned = await createMember(base, {
      name: "Dimas",
      number: DIMAS,
      roleIds: [roles.Fotografer],
    });
    const free = await createMember(base, {
      name: "Ayu",
      number: AYU,
      roleIds: [roles.Fotografer],
    });
    await seedAssignment(
      db,
      base,
      await seedProjectWithSession(db, base),
      assigned,
      roles.Fotografer,
    );

    expect(await repository.delete(base, assigned)).toBe("HAS_ASSIGNMENTS");
    expect(await repository.delete(base, free)).toBe("DELETED");
    expect(await repository.delete(base, free)).toBe("NOT_FOUND");
    expect((await page(base, {})).map((member) => member.name)).toEqual(["Dimas"]);
    const leftover = await db
      .select({ memberId: teamMemberRole.memberId })
      .from(teamMemberRole)
      .where(eq(teamMemberRole.memberId, free));
    expect(leftover).toEqual([]);
  });

  it("AC-TEAM-022 never archives or deletes another workspace's member", async () => {
    const first = await seedTeamWorkspace(db);
    const second = await seedTeamWorkspace(db);
    const roles = await seedTeamRoles(db, second, ["Fotografer"]);
    const repository = createDrizzleTeamMemberRepository(db);
    const foreign = await createMember(second, {
      name: "Rahasia",
      number: DIMAS,
      roleIds: [roles.Fotografer],
    });
    expect(
      await repository.setArchived(first, {
        id: foreign,
        isArchived: true,
        editorUserId: first.ownerId,
      }),
    ).toBe(false);
    expect(await repository.delete(first, foreign)).toBe("NOT_FOUND");
    expect((await page(second, {})).map((member) => member.name)).toEqual(["Rahasia"]);
  });
});
