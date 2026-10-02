import { uniqueEmail } from "@tests/support/auth/unique";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleClientRepository } from "@/adapters/db/client-repository/drizzle-client-repository";
import { user } from "@/adapters/db/schema/auth/auth";
import { client } from "@/adapters/db/schema/booking/client";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import { whatsappNumberSchema } from "@/features/booking/domain/whatsapp-number/whatsapp-number.schema";
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
  await db.insert(user).values({ id: ownerId, name: "Client Owner", email: uniqueEmail() });
  const rows = await db
    .insert(workspace)
    .values({ ownerUserId: ownerId, name: `Clients ${crypto.randomUUID()}`, invoicePrefix: "CLI" })
    .returning({ id: workspace.id });
  const id = rows.at(0)?.id;
  if (!id) throw new Error("workspace fixture");
  return { workspaceId: asWorkspaceId(id), ownerId };
}

describe("Drizzle client repository", () => {
  it("AC-CLI-006 creates and lists scoped normalised clients", async () => {
    const context = await seedWorkspace();
    const clients = createDrizzleClientRepository(db);
    await clients.create(context, {
      name: "Rina",
      whatsappNumber: whatsappNumberSchema.parse("6281234567890"),
      socialLinks: [{ platform: "INSTAGRAM", value: "rina.wed" }],
      editorUserId: context.ownerId,
    });
    expect(
      await clients.listPage(context, { status: "ACTIVE", search: null, afterId: null, limit: 31 }),
    ).toMatchObject([
      {
        name: "Rina",
        whatsappNumber: "6281234567890",
        socialLinks: [{ platform: "INSTAGRAM", value: "rina.wed" }],
        isArchived: false,
      },
    ]);
    expect(await clients.count(context, "ACTIVE")).toBe(1);
  });

  it("AC-CLI-004 AC-CLI-018 searches within the workspace and scopes foreign cursors", async () => {
    const first = await seedWorkspace();
    const other = await seedWorkspace();
    const clients = createDrizzleClientRepository(db);
    await clients.create(first, {
      name: "Rina",
      whatsappNumber: whatsappNumberSchema.parse("6281234567890"),
      socialLinks: [],
      editorUserId: first.ownerId,
    });
    await clients.create(other, {
      name: "Rina Other",
      whatsappNumber: whatsappNumberSchema.parse("6289999999999"),
      socialLinks: [],
      editorUserId: other.ownerId,
    });
    const own = await clients.listPage(first, {
      status: "ACTIVE",
      search: { text: "RIN", digits: null },
      afterId: null,
      limit: 31,
    });
    const foreign = await clients.listPage(first, {
      status: "ACTIVE",
      search: null,
      afterId:
        (
          await clients.listPage(other, { status: "ACTIVE", search: null, afterId: null, limit: 1 })
        ).at(0)?.id ?? null,
      limit: 31,
    });
    expect(own.map((row) => row.name)).toEqual(["Rina"]);
    expect(foreign).toEqual([]);
  });

  it("AC-CLI-021 counts active and archived clients without applying search", async () => {
    const context = await seedWorkspace();
    const clients = createDrizzleClientRepository(db);
    await clients.create(context, {
      name: "Active",
      whatsappNumber: null,
      socialLinks: [],
      editorUserId: context.ownerId,
    });
    const archived = await clients.create(context, {
      name: "Archived",
      whatsappNumber: whatsappNumberSchema.parse("6282222222222"),
      socialLinks: [],
      editorUserId: context.ownerId,
    });
    const row = (
      await clients.listPage(context, {
        status: "ACTIVE",
        search: { text: "Archived", digits: null },
        afterId: null,
        limit: 1,
      })
    ).at(0);
    if (!row || archived.status !== "CREATED") throw new Error("client fixture");
    await db.update(client).set({ archivedAt: new Date() }).where(eq(client.id, row.id));
    expect(await clients.count(context, "ACTIVE")).toBe(1);
    expect(await clients.count(context, "ARCHIVED")).toBe(1);
  });
});
