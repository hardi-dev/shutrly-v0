import { uniqueEmail } from "@tests/support/auth/unique";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { user } from "@/adapters/db/schema/auth/auth";
import { service, serviceCategory } from "@/adapters/db/schema/booking/catalog";
import { client } from "@/adapters/db/schema/booking/client";
import { project, projectSession } from "@/adapters/db/schema/booking/project";
import { sessionAssignment, teamMember, teamMemberRole } from "@/adapters/db/schema/booking/team";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import { createDrizzleTeamRoleRepository } from "@/adapters/db/team-repository/drizzle-team-role-repository";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { openTestDb } from "../helpers/test-db";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

async function seedWorkspace() {
  const ownerId = crypto.randomUUID();
  await db.insert(user).values({ id: ownerId, name: "Team Owner", email: uniqueEmail() });
  const [ws] = await db
    .insert(workspace)
    .values({ ownerUserId: ownerId, name: `Team ${crypto.randomUUID()}`, invoicePrefix: "TRP" })
    .returning({ id: workspace.id });
  return { workspaceId: asWorkspaceId(ws.id), ownerId };
}

type Base = Awaited<ReturnType<typeof seedWorkspace>>;

async function addMember(base: Base, whatsappNumber: string) {
  const [row] = await db
    .insert(teamMember)
    .values({ workspaceId: base.workspaceId, name: "Dimas Pratama", whatsappNumber })
    .returning({ id: teamMember.id });
  return row.id;
}

async function assignOnly(base: Base, memberId: string, roleId: string) {
  const suffix = crypto.randomUUID();
  const [category] = await db
    .insert(serviceCategory)
    .values({ workspaceId: base.workspaceId, name: `Cat ${suffix}`, updatedBy: base.ownerId })
    .returning({ id: serviceCategory.id });
  const [svc] = await db
    .insert(service)
    .values({
      workspaceId: base.workspaceId,
      categoryId: category.id,
      name: `Svc ${suffix}`,
      basePrice: "750000",
    })
    .returning({ id: service.id });
  const [rina] = await db
    .insert(client)
    .values({ workspaceId: base.workspaceId, name: `Rina ${suffix}` })
    .returning({ id: client.id });
  const [row] = await db
    .insert(project)
    .values({
      workspaceId: base.workspaceId,
      clientId: rina.id,
      serviceId: svc.id,
      title: "Wisuda",
      agreedPrice: "750000",
      status: "BOOKED",
      clientAccessToken: Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString(
        "base64url",
      ),
    })
    .returning({ id: project.id });
  const [session] = await db
    .insert(projectSession)
    .values({
      workspaceId: base.workspaceId,
      projectId: row.id,
      name: "Akad",
      sessionDate: "2026-11-01",
    })
    .returning({ id: projectSession.id });
  await db.insert(sessionAssignment).values({
    workspaceId: base.workspaceId,
    projectId: row.id,
    sessionId: session.id,
    memberId,
    roleId,
  });
}

describe("Drizzle team role repository", () => {
  it("AC-TEAM-009 creates, lists by name and reports a duplicate ignoring case", async () => {
    const base = await seedWorkspace();
    const roles = createDrizzleTeamRoleRepository(db);
    await roles.create(base, "Videografer", base.ownerId);
    await roles.create(base, "asisten", base.ownerId);
    expect(await roles.create(base, "videografer", base.ownerId)).toEqual({ status: "DUPLICATE" });
    expect((await roles.list(base)).map((role) => role.name)).toEqual(["asisten", "Videografer"]);
  });

  it("AC-TEAM-009 renames a role and refuses another role's name", async () => {
    const base = await seedWorkspace();
    const roles = createDrizzleTeamRoleRepository(db);
    const created = await roles.create(base, "Fotografer", base.ownerId);
    await roles.create(base, "Videografer", base.ownerId);
    if (created.status !== "CREATED") throw new Error("fixture");
    expect(await roles.rename(base, created.id, "Videografer", base.ownerId)).toEqual({
      status: "DUPLICATE",
    });
    expect(await roles.rename(base, created.id, "fotografer", base.ownerId)).toBe("UPDATED");
    expect(await roles.rename(base, crypto.randomUUID(), "Editor", base.ownerId)).toBe("NOT_FOUND");
  });

  it("AC-TEAM-009 counts usage by members holding the role and by assignments alone", async () => {
    const base = await seedWorkspace();
    const roles = createDrizzleTeamRoleRepository(db);
    const held = await roles.create(base, "Fotografer", base.ownerId);
    const assigned = await roles.create(base, "Videografer", base.ownerId);
    const unused = await roles.create(base, "Asisten", base.ownerId);
    if (held.status !== "CREATED" || assigned.status !== "CREATED" || unused.status !== "CREATED")
      throw new Error("fixture");
    const dimas = await addMember(base, "6281298765432");
    const ayu = await addMember(base, "6281244102231");
    await db
      .insert(teamMemberRole)
      .values({ workspaceId: base.workspaceId, memberId: dimas, roleId: held.id });
    await db
      .insert(teamMemberRole)
      .values({ workspaceId: base.workspaceId, memberId: ayu, roleId: held.id });
    await assignOnly(base, dimas, assigned.id);
    await assignOnly(base, dimas, held.id);

    const usage = new Map((await roles.list(base)).map((role) => [role.name, role.usage]));
    expect(usage.get("Fotografer")).toBe(2);
    expect(usage.get("Videografer")).toBe(1);
    expect(usage.get("Asisten")).toBe(0);

    expect(await roles.delete(base, held.id)).toEqual({ status: "IN_USE", usage: 2 });
    expect(await roles.delete(base, assigned.id)).toEqual({ status: "IN_USE", usage: 1 });
    expect(await roles.delete(base, unused.id)).toBe("DELETED");
    expect(await roles.delete(base, unused.id)).toBe("NOT_FOUND");
  });

  it("AC-TEAM-022 never reads, renames or deletes another workspace's role", async () => {
    const first = await seedWorkspace();
    const second = await seedWorkspace();
    const roles = createDrizzleTeamRoleRepository(db);
    const foreign = await roles.create(second, "Rahasia", second.ownerId);
    if (foreign.status !== "CREATED") throw new Error("fixture");
    expect(await roles.list(first)).toEqual([]);
    expect(await roles.rename(first, foreign.id, "Dicuri", first.ownerId)).toBe("NOT_FOUND");
    expect(await roles.delete(first, foreign.id)).toBe("NOT_FOUND");
    expect((await roles.list(second)).map((role) => role.name)).toEqual(["Rahasia"]);
  });
});
