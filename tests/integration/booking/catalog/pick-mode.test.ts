import { uniqueEmail } from "@tests/support/auth/unique";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createDrizzleCategoryRepository } from "@/adapters/db/catalog-repository/drizzle-category-repository";
import { createDrizzleItemDefinitionRepository } from "@/adapters/db/catalog-repository/drizzle-item-definition-repository";
import { createDrizzleServiceRepository } from "@/adapters/db/catalog-repository/drizzle-service-repository";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";
import { user } from "@/adapters/db/schema/auth/auth";
import { serviceItemDefinition } from "@/adapters/db/schema/booking/catalog";
import { client } from "@/adapters/db/schema/booking/client";
import { projectItem } from "@/adapters/db/schema/booking/project";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import type { ItemDefinitionInput } from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";
import { DEFAULT_ITEM_DEFINITIONS } from "@/features/booking/domain/default-item-definitions/default-item-definitions";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { openTestDb } from "../../helpers/test-db";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

async function seedWorkspace() {
  const ownerId = crypto.randomUUID();
  await db.insert(user).values({ id: ownerId, name: "Pick Owner", email: uniqueEmail() });
  const rows = await db
    .insert(workspace)
    .values({ ownerUserId: ownerId, name: `Pick ${crypto.randomUUID()}`, invoicePrefix: "PCK" })
    .returning({ id: workspace.id });
  const id = rows.at(0)?.id;
  if (!id) throw new Error("workspace insert returned no row");
  return { workspaceId: asWorkspaceId(id), ownerId };
}

const BINGKAI: ItemDefinitionInput = {
  name: "Bingkai",
  valueType: "NUMBER",
  unit: "buah",
  selectionRequired: true,
  pickMode: "QUANTITY",
  allowsPickNotes: false,
  editorUserId: null,
};

async function serviceWithBingkai(context: Awaited<ReturnType<typeof seedWorkspace>>) {
  const definitions = createDrizzleItemDefinitionRepository(db);
  const services = createDrizzleServiceRepository(db);
  await definitions.create(context, { ...BINGKAI, editorUserId: context.ownerId });
  const bingkai = (await definitions.list(context)).find((row) => row.name === "Bingkai");
  const category = await createDrizzleCategoryRepository(db).create(
    context,
    "Wisuda",
    context.ownerId,
  );
  if (!bingkai || category.status !== "CREATED") throw new Error("catalog fixture");
  const created = await services.create(context, {
    name: "Wisuda Bingkai",
    categoryId: category.id,
    basePrice: "500000",
    editorUserId: context.ownerId,
  });
  if (created.status !== "CREATED") throw new Error("service fixture");
  await services.addItem(
    context,
    created.id,
    bingkai.id,
    { type: "NUMBER", value: "2" },
    context.ownerId,
  );
  return { bingkaiId: bingkai.id, serviceId: created.id };
}

describe("catalog pick mode (AC-CAT-001)", () => {
  it("AC-CAT-001 BR-CAT-011 seeds Foto edit with notes on and Foto cetak with notes off", async () => {
    const context = await seedWorkspace();
    const definitions = createDrizzleItemDefinitionRepository(db);
    await definitions.seedDefaults(
      context,
      DEFAULT_ITEM_DEFINITIONS.map((definition) => ({ ...definition, editorUserId: null })),
    );
    const rows = await definitions.list(context);
    expect(rows.find((row) => row.name === "Foto edit")).toMatchObject({
      pickMode: "COUNT",
      allowsPickNotes: true,
    });
    expect(rows.find((row) => row.name === "Foto cetak")).toMatchObject({
      pickMode: "QUANTITY",
      allowsPickNotes: false,
    });
  });

  it("AC-CAT-001 BR-PRJ-001 snapshots the studio's own item with its pick mode", async () => {
    const context = await seedWorkspace();
    const { serviceId } = await serviceWithBingkai(context);
    const [rina] = await db
      .insert(client)
      .values({ workspaceId: context.workspaceId, name: "Rina" })
      .returning({ id: client.id });
    const services = createDrizzleServiceRepository(db);
    const detail = await services.findDetail(context, serviceId);
    const repository = createDrizzleProjectRepository(db);
    const created = await repository.createSnapshot(context, {
      status: "BOOKED",
      clientId: rina.id,
      serviceId,
      title: "Wisuda — Rina",
      notes: null,
      agreedPrice: "500000",
      accessToken: Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url"),
      actorId: context.ownerId,
      items: (detail?.items ?? []).map((item) => ({
        definitionId: item.definitionId,
        value: item.value,
      })),
      fieldValues: {},
      sessions: [],
    });
    if (created.status !== "CREATED") throw new Error("not created");
    const items = await db
      .select({
        pickMode: projectItem.pickMode,
        notes: projectItem.allowsPickNotes,
        legacy: projectItem.selectionType,
      })
      .from(projectItem)
      .where(eq(projectItem.projectId, created.id));
    expect(items).toEqual([{ pickMode: "QUANTITY", notes: false, legacy: "PRINT" }]);
  });

  it("AC-CAT-001 BR-CAT-010 locks the pick mode and notes once a service uses the item", async () => {
    const context = await seedWorkspace();
    const { bingkaiId } = await serviceWithBingkai(context);
    const definitions = createDrizzleItemDefinitionRepository(db);
    const edit = (change: Partial<ItemDefinitionInput>) =>
      definitions.update(context, bingkaiId, {
        ...BINGKAI,
        ...change,
        editorUserId: context.ownerId,
      });
    expect(await edit({ pickMode: "COUNT" })).toBe("LOCKED");
    expect(await edit({ allowsPickNotes: true })).toBe("LOCKED");
    expect(await edit({ name: "Bingkai kayu", unit: "pcs" })).toBe("UPDATED");
  });

  it("R-4 derives the pick mode for a branch that still writes only the legacy column", async () => {
    const context = await seedWorkspace();
    const [row] = await db
      .insert(serviceItemDefinition)
      .values({
        workspaceId: context.workspaceId,
        name: "Album",
        valueType: "NUMBER",
        selectionRequired: true,
        selectionType: "EDIT",
      })
      .returning({
        pickMode: serviceItemDefinition.pickMode,
        notes: serviceItemDefinition.allowsPickNotes,
      });
    expect(row).toEqual({ pickMode: "COUNT", notes: true });
  });
});
