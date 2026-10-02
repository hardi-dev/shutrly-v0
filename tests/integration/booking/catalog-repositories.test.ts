import { uniqueEmail } from "@tests/support/auth/unique";
import { and, count, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createDrizzleCategoryRepository } from "@/adapters/db/catalog-repository/drizzle-category-repository";
import { createDrizzleItemDefinitionRepository } from "@/adapters/db/catalog-repository/drizzle-item-definition-repository";
import { createDrizzleServiceRepository } from "@/adapters/db/catalog-repository/drizzle-service-repository";
import type { Db } from "@/adapters/db/client/client.types";
import { user } from "@/adapters/db/schema/auth/auth";
import { service, serviceItem, serviceItemDefinition } from "@/adapters/db/schema/booking/catalog";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import { DEFAULT_ITEM_DEFINITIONS } from "@/features/booking/domain/default-item-definitions/default-item-definitions";
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
  await db.insert(user).values({ id: ownerId, name: "Catalog Owner", email: uniqueEmail() });
  const rows = await db
    .insert(workspace)
    .values({ ownerUserId: ownerId, name: `Catalog ${crypto.randomUUID()}`, invoicePrefix: "CAT" })
    .returning({ id: workspace.id });
  const id = rows.at(0)?.id;
  if (!id) throw new Error("workspace insert returned no row");
  return { workspaceId: asWorkspaceId(id), ownerId };
}

describe("Drizzle catalog repositories", () => {
  it("AC-CAT-001/002 seeds four definitions idempotently and preserves an existing one", async () => {
    const context = await seedWorkspace();
    const definitions = createDrizzleItemDefinitionRepository(db);
    await definitions.create(context, {
      ...DEFAULT_ITEM_DEFINITIONS[0],
      unit: "custom",
      editorUserId: context.ownerId,
    });
    await definitions.seedDefaults(
      context,
      DEFAULT_ITEM_DEFINITIONS.map((definition) => ({ ...definition, editorUserId: null })),
    );
    await definitions.seedDefaults(
      context,
      DEFAULT_ITEM_DEFINITIONS.map((definition) => ({ ...definition, editorUserId: null })),
    );
    expect(await definitions.list(context)).toHaveLength(4);
    expect((await definitions.list(context)).find((row) => row.name === "Foto edit")?.unit).toBe(
      "custom",
    );
  });

  it("AC-CAT-019 scopes duplicate names by workspace and kind", async () => {
    const first = await seedWorkspace();
    const second = await seedWorkspace();
    const categories = createDrizzleCategoryRepository(db);
    const definitions = createDrizzleItemDefinitionRepository(db);
    expect(await categories.create(first, "Album", first.ownerId)).toMatchObject({
      status: "CREATED",
    });
    expect(
      await definitions.create(first, {
        name: "Album",
        valueType: "NUMBER",
        unit: "buah",
        selectionRequired: false,
        selectionType: null,
        editorUserId: first.ownerId,
      }),
    ).toBe("CREATED");
    expect(await categories.create(first, "album", first.ownerId)).toMatchObject({
      status: "NAME_TAKEN",
    });
    expect(await categories.create(second, "Album", second.ownerId)).toMatchObject({
      status: "CREATED",
    });
  });

  it("AC-CAT-010/011/014 round-trips service values and booking fields", async () => {
    const context = await seedWorkspace();
    const categories = createDrizzleCategoryRepository(db);
    const definitions = createDrizzleItemDefinitionRepository(db);
    const services = createDrizzleServiceRepository(db);
    const category = await categories.create(context, "Wisuda", context.ownerId);
    if (category.status !== "CREATED") throw new Error("category fixture");
    await definitions.seedDefaults(
      context,
      DEFAULT_ITEM_DEFINITIONS.map((definition) => ({ ...definition, editorUserId: null })),
    );
    const definition = (await definitions.list(context)).find((row) => row.name === "Foto edit");
    if (!definition) throw new Error("definition fixture");
    const created = await services.create(context, {
      name: "Wisuda Basic",
      categoryId: category.id,
      basePrice: "750000",
      editorUserId: context.ownerId,
    });
    if (created.status !== "CREATED") throw new Error("service fixture");
    expect(
      await services.addItem(
        context,
        created.id,
        definition.id,
        { type: "NUMBER", value: "25" },
        context.ownerId,
      ),
    ).toBe("ADDED");
    expect(
      await services.addField(context, created.id, {
        name: "Nama kampus",
        fieldType: "TEXT",
        isRequired: true,
        options: null,
        editorUserId: context.ownerId,
      }),
    ).toBe("ADDED");
    const detail = await services.findDetail(context, created.id);
    expect(detail).toMatchObject({
      basePrice: "750000",
      items: [{ value: { type: "NUMBER", value: "25" } }],
      fields: [{ key: "nama_kampus" }],
    });
  });

  it("AC-CAT-021 does not read or mutate another workspace's IDs", async () => {
    const owner = await seedWorkspace();
    const other = await seedWorkspace();
    const categories = createDrizzleCategoryRepository(db);
    const created = await categories.create(owner, "Wisuda", owner.ownerId);
    if (created.status !== "CREATED") throw new Error("category fixture");
    expect(await categories.list(other)).toEqual([]);
    expect(
      await categories.rename(other, {
        id: created.id,
        name: "Hijack",
        editorUserId: other.ownerId,
      }),
    ).toBe("NOT_FOUND");
    expect(
      await categories.setActive(other, {
        id: created.id,
        isActive: false,
        editorUserId: other.ownerId,
      }),
    ).toBe(false);
    expect((await categories.list(owner)).at(0)?.name).toBe("Wisuda");
  });

  it("AC-CAT-018 deletes a service with cascading children and reports usage counts", async () => {
    const context = await seedWorkspace();
    const definitions = createDrizzleItemDefinitionRepository(db);
    const services = createDrizzleServiceRepository(db);
    const categories = createDrizzleCategoryRepository(db);
    const category = await categories.create(context, "Wisuda", context.ownerId);
    if (category.status !== "CREATED") throw new Error("category fixture");
    await definitions.seedDefaults(
      context,
      DEFAULT_ITEM_DEFINITIONS.map((definition) => ({ ...definition, editorUserId: null })),
    );
    const definition = (await definitions.list(context)).at(0);
    if (!definition) throw new Error("definition fixture");
    const created = await services.create(context, {
      name: "Wisuda",
      categoryId: category.id,
      basePrice: "750000",
      editorUserId: context.ownerId,
    });
    if (created.status !== "CREATED") throw new Error("service fixture");
    await services.addItem(
      context,
      created.id,
      definition.id,
      { type: "NUMBER", value: "1" },
      context.ownerId,
    );
    expect(await services.delete(context, created.id)).toBe("DELETED");
    expect(
      (
        await db
          .select({ n: count() })
          .from(serviceItem)
          .where(eq(serviceItem.serviceId, created.id))
      ).at(0)?.n,
    ).toBe(0);
    expect(
      (await db.select({ n: count() }).from(service).where(eq(service.id, created.id))).at(0)?.n,
    ).toBe(0);
    expect(
      (
        await db
          .select({ n: count() })
          .from(serviceItemDefinition)
          .where(
            and(
              eq(serviceItemDefinition.workspaceId, context.workspaceId),
              eq(serviceItemDefinition.id, definition.id),
            ),
          )
      ).at(0)?.n,
    ).toBe(1);
  });
});
