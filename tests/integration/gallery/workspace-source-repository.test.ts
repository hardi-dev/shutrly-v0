import { uniqueEmail } from "@tests/support/auth/unique";
import { and, count, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleMessageTemplateRepository } from "@/adapters/db/message-template-repository/drizzle-message-template-repository";
import { user } from "@/adapters/db/schema/auth/auth";
import { workspaceSourceConfig } from "@/adapters/db/schema/gallery/workspace-source-config";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import { createDrizzleWorkspaceRepository } from "@/adapters/db/workspace-repository/drizzle-workspace-repository";
import { createDrizzleWorkspaceSourceRepository } from "@/adapters/db/workspace-source-repository/drizzle-workspace-source-repository";
import { seedDefaultTemplates } from "@/features/communications/application/use-cases/seed-default-templates/seed-default-templates";
import { seedDefaultSource } from "@/features/gallery/application/use-cases/seed-default-source/seed-default-source";
import { normaliseInvoicePrefix } from "@/features/workspace/domain/invoice-prefix/invoice-prefix";
import { asOwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id";
import { normaliseWorkspaceName } from "@/features/workspace/domain/workspace-name/workspace-name";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { openTestDb } from "../helpers/test-db";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

async function seedOwner(): Promise<string> {
  const id = crypto.randomUUID();
  await db.insert(user).values({ id, name: "Owner", email: uniqueEmail() });
  return id;
}

async function seedWorkspace(ownerId: string) {
  const rows = await db
    .insert(workspace)
    .values({ ownerUserId: ownerId, name: `WS ${crypto.randomUUID()}`, invoicePrefix: "WS" })
    .returning({ id: workspace.id });
  const id = rows.at(0)?.id;
  if (!id) throw new Error("workspace insert returned no row");
  return { workspaceId: asWorkspaceId(id) };
}

async function sourceCount(workspaceId: string): Promise<number> {
  const rows = await db
    .select({ n: count() })
    .from(workspaceSourceConfig)
    .where(eq(workspaceSourceConfig.workspaceId, workspaceId));
  return rows.at(0)?.n ?? 0;
}

describe("Drizzle workspace source repository", () => {
  it("AC-SRC-002 seeds one Google Drive source idempotently", async () => {
    const context = await seedWorkspace(await seedOwner());
    const sources = createDrizzleWorkspaceSourceRepository(db);
    await seedDefaultSource(sources, context);
    await seedDefaultSource(sources, context);

    expect(await sourceCount(context.workspaceId)).toBe(1);
    expect(await sources.listForWorkspace(context)).toEqual([
      expect.objectContaining({
        provider: "GOOGLE_DRIVE",
        displayName: "Google Drive",
        isActive: true,
      }),
    ]);
    const rows = await db
      .select({ configData: workspaceSourceConfig.configData })
      .from(workspaceSourceConfig)
      .where(eq(workspaceSourceConfig.workspaceId, context.workspaceId));
    expect(rows).toEqual([{ configData: {} }]);
  });

  it("AC-SRC-009 scopes duplicate names to one workspace", async () => {
    const first = await seedWorkspace(await seedOwner());
    const second = await seedWorkspace(await seedOwner());
    const sources = createDrizzleWorkspaceSourceRepository(db);
    await seedDefaultSource(sources, first);

    await expect(
      sources.create(first, {
        provider: "GOOGLE_DRIVE",
        displayName: "google drive",
        editorUserId: null,
      }),
    ).resolves.toBe("NAME_TAKEN");
    await expect(
      sources.create(second, {
        provider: "GOOGLE_DRIVE",
        displayName: "Google Drive",
        editorUserId: null,
      }),
    ).resolves.toBe("CREATED");
  });

  it("AC-SRC-011 updates active state and AC-SRC-012 deletes", async () => {
    const ownerId = await seedOwner();
    const context = await seedWorkspace(ownerId);
    const sources = createDrizzleWorkspaceSourceRepository(db);
    await sources.create(context, {
      provider: "GOOGLE_DRIVE",
      displayName: "Arsip",
      editorUserId: null,
    });
    const id = (await sources.listForWorkspace(context)).at(0)?.id;
    if (!id) throw new Error("source insert returned no row");

    await expect(
      sources.setActive(context, { id, isActive: false, editorUserId: ownerId }),
    ).resolves.toBe(true);
    expect((await sources.listForWorkspace(context)).at(0)?.isActive).toBe(false);
    await expect(
      sources.setActive(context, { id, isActive: true, editorUserId: ownerId }),
    ).resolves.toBe(true);
    await expect(sources.delete(context, id)).resolves.toBe("DELETED");
    await expect(sources.delete(context, id)).resolves.toBe("NOT_FOUND");
  });

  it("AC-SRC-015 never reads or changes another workspace's source", async () => {
    const mine = await seedWorkspace(await seedOwner());
    const theirs = await seedWorkspace(await seedOwner());
    const sources = createDrizzleWorkspaceSourceRepository(db);
    await seedDefaultSource(sources, theirs);
    const id = (await sources.listForWorkspace(theirs)).at(0)?.id;
    if (!id) throw new Error("source insert returned no row");

    expect(await sources.listForWorkspace(mine)).toEqual([]);
    await expect(
      sources.rename(mine, { id, displayName: "Hijack", editorUserId: "owner" }),
    ).resolves.toBe("NOT_FOUND");
    await expect(
      sources.setActive(mine, { id, isActive: false, editorUserId: "owner" }),
    ).resolves.toBe(false);
    await expect(sources.delete(mine, id)).resolves.toBe("NOT_FOUND");
    expect((await sources.listForWorkspace(theirs)).at(0)?.displayName).toBe("Google Drive");
  });

  it("AC-SRC-016 stores an empty JSON object, never credentials", async () => {
    const context = await seedWorkspace(await seedOwner());
    const sources = createDrizzleWorkspaceSourceRepository(db);
    await sources.create(context, {
      provider: "GOOGLE_DRIVE",
      displayName: "Public Drive",
      editorUserId: null,
    });
    const rows = await db
      .select({ configData: workspaceSourceConfig.configData })
      .from(workspaceSourceConfig)
      .where(
        and(
          eq(workspaceSourceConfig.workspaceId, context.workspaceId),
          eq(workspaceSourceConfig.displayName, "Public Drive"),
        ),
      );
    expect(rows).toEqual([{ configData: {} }]);
  });

  it("AC-SRC-001 ADR-016 rolls back source seeding with a failed transaction", async () => {
    const ownerId = await seedOwner();
    const name = `Rollback ${crypto.randomUUID()}`;
    await expect(
      db.transaction(async (tx) => {
        const created = await createDrizzleWorkspaceRepository(tx).create(asOwnerUserId(ownerId), {
          name: normaliseWorkspaceName(name),
          invoicePrefix: normaliseInvoicePrefix("RB"),
          currency: "IDR",
        });
        if (!created.ok) throw new Error("unexpected duplicate");
        await seedDefaultTemplates(createDrizzleMessageTemplateRepository(tx), {
          workspaceId: created.id,
        });
        await seedDefaultSource(createDrizzleWorkspaceSourceRepository(tx), {
          workspaceId: created.id,
        });
        throw new Error("simulated failure after seeding");
      }),
    ).rejects.toThrow("simulated failure after seeding");
    const rows = await db.select().from(workspace).where(eq(workspace.name, name));
    expect(rows).toEqual([]);
  });
});
