import { readFileSync } from "node:fs";

import { uniqueEmail } from "@tests/support/auth/unique";
import { eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { user } from "@/adapters/db/schema/auth/auth";
import { teamRole } from "@/adapters/db/schema/booking/team";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import { createDrizzleTeamRoleRepository } from "@/adapters/db/team-repository/drizzle-team-role-repository";
import { seedDefaultTeamRoles } from "@/features/booking/application/use-cases/seed-default-team-roles/seed-default-team-roles";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { openTestDb } from "../helpers/test-db";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

const backfillSql = readFileSync(
  new URL("../../../drizzle/0011_team_role_backfill.sql", import.meta.url),
  "utf8",
);

async function seedWorkspace(name = `Roles ${crypto.randomUUID()}`) {
  const ownerId = crypto.randomUUID();
  await db.insert(user).values({ id: ownerId, name: "Role Owner", email: uniqueEmail() });
  const [ws] = await db
    .insert(workspace)
    .values({ ownerUserId: ownerId, name, invoicePrefix: "ROL" })
    .returning({ id: workspace.id });
  return { workspaceId: asWorkspaceId(ws.id) };
}

async function roleNames(workspaceId: string) {
  const rows = await db
    .select({ name: teamRole.name })
    .from(teamRole)
    .where(eq(teamRole.workspaceId, workspaceId));
  return rows.map((row) => row.name).sort((a, b) => a.localeCompare(b));
}

describe("default team roles", () => {
  it("AC-TEAM-008 a seeded workspace has three roles, and seeding twice adds none", async () => {
    const context = await seedWorkspace();
    const roles = createDrizzleTeamRoleRepository(db);
    await seedDefaultTeamRoles(roles, context);
    await seedDefaultTeamRoles(roles, context);
    expect(await roleNames(context.workspaceId)).toEqual(["Asisten", "Fotografer", "Videografer"]);
  });

  it("AC-TEAM-008 the backfill adds only the missing roles, ignoring case", async () => {
    const context = await seedWorkspace();
    await db.insert(teamRole).values({ workspaceId: context.workspaceId, name: "fotografer" });
    await db.execute(sql.raw(backfillSql));
    expect(await roleNames(context.workspaceId)).toEqual(["Asisten", "fotografer", "Videografer"]);
  });

  it("AC-TEAM-008 ADR-016 a failed creation transaction leaves no workspace and no roles", async () => {
    const name = `Rollback ${crypto.randomUUID()}`;
    const ownerId = crypto.randomUUID();
    await db.insert(user).values({ id: ownerId, name: "Rollback Owner", email: uniqueEmail() });
    let workspaceId = "";
    await expect(
      db.transaction(async (tx) => {
        const [created] = await tx
          .insert(workspace)
          .values({ ownerUserId: ownerId, name, invoicePrefix: "RB" })
          .returning({ id: workspace.id });
        workspaceId = created.id;
        await seedDefaultTeamRoles(createDrizzleTeamRoleRepository(tx), {
          workspaceId: asWorkspaceId(created.id),
        });
        throw new Error("simulated failure after seeding");
      }),
    ).rejects.toThrow("simulated failure after seeding");
    expect(await db.select().from(workspace).where(eq(workspace.name, name))).toEqual([]);
    expect(await roleNames(workspaceId)).toEqual([]);
  });
});
