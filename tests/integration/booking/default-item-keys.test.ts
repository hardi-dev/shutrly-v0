import { uniqueEmail } from "@tests/support/auth/unique";
import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createDrizzleItemDefinitionRepository } from "@/adapters/db/catalog-repository/drizzle-item-definition-repository";
import type { Db } from "@/adapters/db/client/client.types";
import { user } from "@/adapters/db/schema/auth/auth";
import { serviceItemDefinition } from "@/adapters/db/schema/booking/catalog";
import { teamRole } from "@/adapters/db/schema/booking/team";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import { createDrizzleTeamRoleRepository } from "@/adapters/db/team-repository/drizzle-team-role-repository";
import { seedDefaultItemDefinitions } from "@/features/booking/application/use-cases/seed-default-item-definitions/seed-default-item-definitions";
import { seedDefaultTeamRoles } from "@/features/booking/application/use-cases/seed-default-team-roles/seed-default-team-roles";
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
  await db.insert(user).values({ id: ownerId, name: "Owner", email: uniqueEmail() });
  const rows = await db
    .insert(workspace)
    .values({ ownerUserId: ownerId, name: `WS ${crypto.randomUUID()}`, invoicePrefix: "WS" })
    .returning({ id: workspace.id });
  return { workspaceId: asWorkspaceId(rows[0]?.id ?? ""), ownerId };
}

async function idOf(workspaceId: string, name: string): Promise<string> {
  const rows = await db
    .select({ id: serviceItemDefinition.id })
    .from(serviceItemDefinition)
    .where(
      and(eq(serviceItemDefinition.workspaceId, workspaceId), eq(serviceItemDefinition.name, name)),
    );
  return rows.at(0)?.id ?? "";
}

describe("platform default item keys", () => {
  it("D-18 seeds the key with the item and a rename clears it in the same update", async () => {
    const context = await seedWorkspace();
    const repository = createDrizzleItemDefinitionRepository(db);
    await seedDefaultItemDefinitions(repository, context, "id");
    const id = await idOf(context.workspaceId, "Foto edit");
    const [seeded] = await db
      .select({ key: serviceItemDefinition.defaultKey })
      .from(serviceItemDefinition)
      .where(eq(serviceItemDefinition.id, id));
    expect(seeded.key).toBe("EDITED_PHOTOS");

    await repository.update(context, id, {
      name: "Foto edit baru",
      valueType: "NUMBER",
      unit: "foto",
      selectionRequired: true,
      pickMode: "COUNT",
      allowsPickNotes: true,
      editorUserId: null,
    });
    const [renamed] = await db
      .select({ key: serviceItemDefinition.defaultKey })
      .from(serviceItemDefinition)
      .where(eq(serviceItemDefinition.id, id));
    expect(renamed.key).toBeNull();
  });

  it("D-18 seeds role keys and a role rename clears its key", async () => {
    const { ownerId, ...context } = await seedWorkspace();
    const roles = createDrizzleTeamRoleRepository(db);
    await seedDefaultTeamRoles(roles, context, "id");
    const [photographer] = await db
      .select({ id: teamRole.id, key: teamRole.defaultKey })
      .from(teamRole)
      .where(and(eq(teamRole.workspaceId, context.workspaceId), eq(teamRole.name, "Fotografer")));
    expect(photographer.key).toBe("PHOTOGRAPHER");

    await roles.rename(context, photographer.id, "Fotografer utama", ownerId);
    const [renamed] = await db
      .select({ key: teamRole.defaultKey })
      .from(teamRole)
      .where(eq(teamRole.id, photographer.id));
    expect(renamed.key).toBeNull();
  });
  it("D-18 the item list and get carry the key, and a renamed item has none", async () => {
    const context = await seedWorkspace();
    const repository = createDrizzleItemDefinitionRepository(db);
    await seedDefaultItemDefinitions(repository, context, "id");
    const id = await idOf(context.workspaceId, "Foto edit");
    const listed = (await repository.list(context)).find((row) => row.id === id);
    expect(listed?.defaultKey).toBe("EDITED_PHOTOS");
    expect((await repository.findById(context, id))?.defaultKey).toBe("EDITED_PHOTOS");

    await repository.update(context, id, {
      name: "Foto edit baru",
      valueType: "NUMBER",
      unit: "foto",
      selectionRequired: true,
      pickMode: "COUNT",
      allowsPickNotes: true,
      editorUserId: null,
    });
    expect((await repository.findById(context, id))?.defaultKey).toBeNull();
  });

  it("D-18 the team role list carries the key, and a renamed role has none", async () => {
    const { ownerId, ...context } = await seedWorkspace();
    const roles = createDrizzleTeamRoleRepository(db);
    await seedDefaultTeamRoles(roles, context, "id");
    const photographer = (await roles.list(context)).find((row) => row.name === "Fotografer");
    expect(photographer?.defaultKey).toBe("PHOTOGRAPHER");

    await roles.rename(context, photographer?.id ?? "", "Fotografer utama", ownerId);
    const renamed = (await roles.list(context)).find((row) => row.id === photographer?.id);
    expect(renamed?.defaultKey).toBeNull();
  });
});
