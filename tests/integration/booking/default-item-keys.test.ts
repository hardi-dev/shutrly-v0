import { uniqueEmail } from "@tests/support/auth/unique";
import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createDrizzleItemDefinitionRepository } from "@/adapters/db/catalog-repository/drizzle-item-definition-repository";
import type { Db } from "@/adapters/db/client/client.types";
import { user } from "@/adapters/db/schema/auth/auth";
import { serviceItemDefinition } from "@/adapters/db/schema/booking/catalog";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import { seedDefaultItemDefinitions } from "@/features/booking/application/use-cases/seed-default-item-definitions/seed-default-item-definitions";
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
  return { workspaceId: asWorkspaceId(rows[0]?.id ?? "") };
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
    await seedDefaultItemDefinitions(repository, context);
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
});
