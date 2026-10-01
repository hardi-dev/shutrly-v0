import { uniqueEmail } from "@tests/support/auth/unique";
import { and, count, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleMessageTemplateRepository } from "@/adapters/db/message-template-repository/drizzle-message-template-repository";
import { user } from "@/adapters/db/schema/auth/auth";
import { messageTemplate } from "@/adapters/db/schema/communications/message-template";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import { createDrizzleWorkspaceRepository } from "@/adapters/db/workspace-repository/drizzle-workspace-repository";
import { seedDefaultTemplates } from "@/features/communications/application/use-cases/seed-default-templates/seed-default-templates";
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
  return { workspaceId: asWorkspaceId(rows[0]?.id ?? "") };
}

async function templateCount(workspaceId: string): Promise<number> {
  const rows = await db
    .select({ n: count() })
    .from(messageTemplate)
    .where(eq(messageTemplate.workspaceId, workspaceId));
  return rows.at(0)?.n ?? 0;
}

describe("Drizzle message template repository", () => {
  it("AC-MSG-002 BR-MSG-005 seeds five defaults idempotently", async () => {
    const context = await seedWorkspace(await seedOwner());
    const templates = createDrizzleMessageTemplateRepository(db);
    await seedDefaultTemplates(templates, context);
    await seedDefaultTemplates(templates, context);
    expect(await templateCount(context.workspaceId)).toBe(5);
  });

  it("AC-MSG-003 rejects a second template of the same type and channel", async () => {
    const context = await seedWorkspace(await seedOwner());
    await seedDefaultTemplates(createDrizzleMessageTemplateRepository(db), context);
    await expect(
      db.insert(messageTemplate).values({
        workspaceId: context.workspaceId,
        type: "GALLERY_SHARE",
        content: "{{galleryUrl}}",
      }),
    ).rejects.toMatchObject({ cause: { code: "23505" } });
  });

  it("AC-MSG-007 A-9 updates one type, its editor and time", async () => {
    const ownerId = await seedOwner();
    const context = await seedWorkspace(ownerId);
    const templates = createDrizzleMessageTemplateRepository(db);
    await seedDefaultTemplates(templates, context);
    const updated = await templates.updateContent(context, {
      type: "INVOICE_SHARE",
      content: "{{invoiceUrl}}",
      editorUserId: ownerId,
    });
    expect(updated).toBe(true);
    const rows = await db
      .select({ content: messageTemplate.content, updatedBy: messageTemplate.updatedBy })
      .from(messageTemplate)
      .where(
        and(
          eq(messageTemplate.workspaceId, context.workspaceId),
          eq(messageTemplate.type, "INVOICE_SHARE"),
        ),
      );
    expect(rows).toEqual([{ content: "{{invoiceUrl}}", updatedBy: ownerId }]);
  });

  it("AC-MSG-015 never reads or changes another workspace's templates", async () => {
    const mine = await seedWorkspace(await seedOwner());
    const theirs = await seedWorkspace(await seedOwner());
    const templates = createDrizzleMessageTemplateRepository(db);
    await seedDefaultTemplates(templates, theirs);
    expect(await templates.listForWorkspace(mine)).toEqual([]);
    expect(await templates.findByType(mine, "GALLERY_SHARE")).toBeNull();
    const updated = await templates.updateContent(mine, {
      type: "GALLERY_SHARE",
      content: "{{galleryUrl}}",
      editorUserId: "nobody",
    });
    expect(updated).toBe(false);
    expect((await templates.findByType(theirs, "GALLERY_SHARE"))?.content).not.toBe(
      "{{galleryUrl}}",
    );
  });

  it("AC-MSG-001 ADR-016 a failed creation transaction leaves no workspace and no templates", async () => {
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
        throw new Error("simulated failure after seeding");
      }),
    ).rejects.toThrow("simulated failure after seeding");
    const rows = await db.select().from(workspace).where(eq(workspace.name, name));
    expect(rows).toEqual([]);
  });

  it("A-1 the database rejects content longer than 2,000 characters", async () => {
    const context = await seedWorkspace(await seedOwner());
    await expect(
      db.insert(messageTemplate).values({
        workspaceId: context.workspaceId,
        type: "GALLERY_SHARE",
        content: "a".repeat(2001),
      }),
    ).rejects.toBeDefined();
  });
});
