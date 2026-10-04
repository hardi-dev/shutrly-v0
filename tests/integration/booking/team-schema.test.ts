import { uniqueEmail } from "@tests/support/auth/unique";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { user } from "@/adapters/db/schema/auth/auth";
import { service, serviceCategory } from "@/adapters/db/schema/booking/catalog";
import { client } from "@/adapters/db/schema/booking/client";
import { project, projectSession } from "@/adapters/db/schema/booking/project";
import {
  sessionAssignment,
  teamMember,
  teamMemberRole,
  teamRole,
} from "@/adapters/db/schema/booking/team";
import { workspace } from "@/adapters/db/schema/workspace/workspace";

import { openTestDb } from "../helpers/test-db";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

const NUMBER_A = "6281298765432";

async function seedWorkspace() {
  const ownerId = crypto.randomUUID();
  await db.insert(user).values({ id: ownerId, name: "Team Owner", email: uniqueEmail() });
  const [ws] = await db
    .insert(workspace)
    .values({ ownerUserId: ownerId, name: `Team ${crypto.randomUUID()}`, invoicePrefix: "TEA" })
    .returning({ id: workspace.id });
  return { workspaceId: ws.id, ownerId };
}

type Base = Awaited<ReturnType<typeof seedWorkspace>>;

async function addMember(base: Base, whatsappNumber: string, overrides = {}) {
  const [row] = await db
    .insert(teamMember)
    .values({ workspaceId: base.workspaceId, name: "Dimas Pratama", whatsappNumber, ...overrides })
    .returning({ id: teamMember.id });
  return row.id;
}

async function addRole(base: Base, name: string) {
  const [row] = await db
    .insert(teamRole)
    .values({ workspaceId: base.workspaceId, name })
    .returning({ id: teamRole.id });
  return row.id;
}

async function addProjectWithSession(base: Base) {
  const suffix = crypto.randomUUID();
  const [category] = await db
    .insert(serviceCategory)
    .values({ workspaceId: base.workspaceId, name: `Wisuda ${suffix}`, updatedBy: base.ownerId })
    .returning({ id: serviceCategory.id });
  const [svc] = await db
    .insert(service)
    .values({
      workspaceId: base.workspaceId,
      categoryId: category.id,
      name: `Basic ${suffix}`,
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
      title: "Wisuda Rina",
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
  return { projectId: row.id, sessionId: session.id };
}

async function assign(
  base: Base,
  target: { projectId: string; sessionId: string },
  memberId: string,
  roleId: string,
) {
  const [row] = await db
    .insert(sessionAssignment)
    .values({ workspaceId: base.workspaceId, ...target, memberId, roleId })
    .returning({ id: sessionAssignment.id });
  return row.id;
}

describe("team schema invariants", () => {
  it("AC-TEAM-009 rejects a second role whose name differs only in case", async () => {
    const base = await seedWorkspace();
    await addRole(base, "Videografer");
    await expect(addRole(base, "videografer")).rejects.toThrow();
    const other = await seedWorkspace();
    await expect(addRole(other, "videografer")).resolves.toBeTypeOf("string");
  });

  it("BR-TEAM-004 rejects a number taken in the workspace and allows it in another", async () => {
    const base = await seedWorkspace();
    await addMember(base, NUMBER_A);
    await expect(addMember(base, NUMBER_A)).rejects.toThrow();
    const other = await seedWorkspace();
    await expect(addMember(other, NUMBER_A)).resolves.toBeTypeOf("string");
  });

  it("BR-TEAM-004 rejects a 0-prefixed number and an upper-case email", async () => {
    const base = await seedWorkspace();
    await expect(addMember(base, "081298765432")).rejects.toThrow();
    await expect(addMember(base, NUMBER_A, { email: "Dimas@Mail.com" })).rejects.toThrow();
    await expect(addMember(base, NUMBER_A, { email: "dimas@mail.com" })).resolves.toBeTypeOf(
      "string",
    );
  });

  it("BR-WS-003 rejects an assignment whose session belongs to another project", async () => {
    const base = await seedWorkspace();
    const first = await addProjectWithSession(base);
    const second = await addProjectWithSession(base);
    const memberId = await addMember(base, NUMBER_A);
    const roleId = await addRole(base, "Fotografer");
    await expect(
      assign(base, { projectId: first.projectId, sessionId: second.sessionId }, memberId, roleId),
    ).rejects.toThrow();
    await expect(assign(base, first, memberId, roleId)).resolves.toBeTypeOf("string");
  });

  it("BR-TEAM-006 rejects the same member twice on one session", async () => {
    const base = await seedWorkspace();
    const target = await addProjectWithSession(base);
    const memberId = await addMember(base, NUMBER_A);
    const photographer = await addRole(base, "Fotografer");
    const videographer = await addRole(base, "Videografer");
    await assign(base, target, memberId, photographer);
    await expect(assign(base, target, memberId, videographer)).rejects.toThrow();
  });

  it("BR-TEAM-005 RESTRICT blocks deleting a role a member holds and a member who is assigned", async () => {
    const base = await seedWorkspace();
    const target = await addProjectWithSession(base);
    const memberId = await addMember(base, NUMBER_A);
    const roleId = await addRole(base, "Fotografer");
    await db.insert(teamMemberRole).values({ workspaceId: base.workspaceId, memberId, roleId });
    await expect(db.delete(teamRole).where(eq(teamRole.id, roleId))).rejects.toThrow();
    await assign(base, target, memberId, roleId);
    await db.delete(teamMemberRole).where(eq(teamMemberRole.memberId, memberId));
    await expect(db.delete(teamRole).where(eq(teamRole.id, roleId))).rejects.toThrow();
    await expect(db.delete(teamMember).where(eq(teamMember.id, memberId))).rejects.toThrow();
  });

  it("BR-TEAM-006 deleting a session deletes its assignments", async () => {
    const base = await seedWorkspace();
    const target = await addProjectWithSession(base);
    const memberId = await addMember(base, NUMBER_A);
    const roleId = await addRole(base, "Fotografer");
    const assignmentId = await assign(base, target, memberId, roleId);
    await db.delete(projectSession).where(eq(projectSession.id, target.sessionId));
    const rows = await db
      .select({ id: sessionAssignment.id })
      .from(sessionAssignment)
      .where(eq(sessionAssignment.id, assignmentId));
    expect(rows).toHaveLength(0);
  });
});
