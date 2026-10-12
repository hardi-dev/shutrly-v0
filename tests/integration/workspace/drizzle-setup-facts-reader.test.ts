import { uniqueEmail } from "@tests/support/auth/unique";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { user } from "@/adapters/db/schema/auth/auth";
import {
  service,
  serviceCategory,
  serviceItem,
  serviceItemDefinition,
} from "@/adapters/db/schema/booking/catalog";
import { client } from "@/adapters/db/schema/booking/client";
import { project } from "@/adapters/db/schema/booking/project";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import { createDrizzleSetupFactsReader } from "@/adapters/db/setup-facts-reader/drizzle-setup-facts-reader";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { openTestDb } from "../helpers/test-db";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

async function seedWorkspace(brandName: string | null = null) {
  const ownerId = crypto.randomUUID();
  await db.insert(user).values({ id: ownerId, name: "Setup Owner", email: uniqueEmail() });
  const rows = await db
    .insert(workspace)
    .values({
      ownerUserId: ownerId,
      name: `Setup ${crypto.randomUUID()}`,
      invoicePrefix: "SET",
      brandName,
    })
    .returning({ id: workspace.id });
  const id = rows.at(0)?.id;
  if (!id) throw new Error("workspace insert returned no row");
  return { workspaceId: asWorkspaceId(id), ownerId };
}

type Seeded = Awaited<ReturnType<typeof seedWorkspace>>;

async function addService(context: Seeded, name: string, isActive = true) {
  const [category] = await db
    .insert(serviceCategory)
    .values({ workspaceId: context.workspaceId, name: `Cat ${name}` })
    .returning({ id: serviceCategory.id });
  const [row] = await db
    .insert(service)
    .values({
      workspaceId: context.workspaceId,
      categoryId: category.id,
      name,
      basePrice: "750000",
      isActive,
    })
    .returning({ id: service.id });
  return row.id;
}

async function addDefinition(context: Seeded, name: string, selection: boolean, isActive = true) {
  const [row] = await db
    .insert(serviceItemDefinition)
    .values(
      selection
        ? {
            workspaceId: context.workspaceId,
            name,
            valueType: "NUMBER",
            unit: "foto",
            selectionRequired: true,
            pickMode: "COUNT",
            isActive,
          }
        : { workspaceId: context.workspaceId, name, valueType: "NUMBER", unit: "jam", isActive },
    )
    .returning({ id: serviceItemDefinition.id });
  return row.id;
}

async function attach(context: Seeded, serviceId: string, definitionId: string, sortOrder = 0) {
  await db.insert(serviceItem).values({
    workspaceId: context.workspaceId,
    serviceId,
    definitionId,
    value: { type: "NUMBER", value: "50" },
    sortOrder,
  });
}

const TOKEN = () => Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");

async function addProject(context: Seeded, status: string) {
  const serviceId = await addService(context, `Svc ${crypto.randomUUID()}`);
  const [owner] = await db
    .insert(client)
    .values({ workspaceId: context.workspaceId, name: "Rina" })
    .returning({ id: client.id });
  const [row] = await db
    .insert(project)
    .values({
      workspaceId: context.workspaceId,
      clientId: owner.id,
      serviceId,
      title: "Wisuda Rina",
      agreedPrice: "750000",
      status,
      clientAccessToken: TOKEN(),
      ...(status === "CANCELLED" ? { cancelledAt: new Date(), cancelledBy: context.ownerId } : {}),
      ...(status === "COMPLETED" ? { completedAt: new Date(), completedBy: context.ownerId } : {}),
    })
    .returning({ id: project.id });
  return row.id;
}

const reader = () => createDrizzleSetupFactsReader(db);

describe("Drizzle setup facts reader", () => {
  it("AC-SETUP-001 reads a new workspace as having nothing set up", async () => {
    const context = await seedWorkspace();
    expect(await reader().read(context)).toEqual({
      hasProject: false,
      activeServiceCount: 0,
      soleActiveServiceId: null,
      hasSelectionItem: false,
      hasBrandName: false,
    });
  });

  it("AC-SETUP-002 counts a project in any status", async () => {
    for (const status of ["DRAFT", "BOOKED", "COMPLETED", "CANCELLED"]) {
      const context = await seedWorkspace();
      await addProject(context, status);
      expect((await reader().read(context)).hasProject).toBe(true);
    }
  });

  it("AC-SETUP-003 stops counting a deleted draft", async () => {
    const context = await seedWorkspace();
    const draftId = await addProject(context, "DRAFT");
    await db.delete(project).where(eq(project.id, draftId));
    expect((await reader().read(context)).hasProject).toBe(false);
  });

  it("AC-SETUP-007 counts only active services, capped at two, with the sole service's ID", async () => {
    const context = await seedWorkspace();
    await addService(context, "Archived", false);
    expect((await reader().read(context)).activeServiceCount).toBe(0);
    const onlyId = await addService(context, "Wedding Basic");
    expect(await reader().read(context)).toMatchObject({
      activeServiceCount: 1,
      soleActiveServiceId: onlyId,
    });
    await addService(context, "Wisuda");
    await addService(context, "Prewed");
    expect(await reader().read(context)).toMatchObject({
      activeServiceCount: 2,
      soleActiveServiceId: null,
    });
  });

  it("AC-SETUP-008 needs a selection item, not any package item", async () => {
    const context = await seedWorkspace();
    const serviceId = await addService(context, "Wedding Basic");
    await attach(context, serviceId, await addDefinition(context, "Durasi pemotretan", false));
    expect((await reader().read(context)).hasSelectionItem).toBe(false);
    await attach(context, serviceId, await addDefinition(context, "Foto edit", true), 1);
    expect((await reader().read(context)).hasSelectionItem).toBe(true);
  });

  it("AC-SETUP-009 ignores a selection item on an archived service", async () => {
    const context = await seedWorkspace();
    const archived = await addService(context, "Old", false);
    await attach(context, archived, await addDefinition(context, "Foto edit", true));
    await addService(context, "Wedding Basic");
    expect((await reader().read(context)).hasSelectionItem).toBe(false);
  });

  it("D-9 counts a selection item whose definition is archived but still on an active service", async () => {
    const context = await seedWorkspace();
    const serviceId = await addService(context, "Wedding Basic");
    await attach(context, serviceId, await addDefinition(context, "Foto edit", true, false));
    expect((await reader().read(context)).hasSelectionItem).toBe(true);
  });

  it("AC-SETUP-014 counts a brand name only when it is not blank", async () => {
    expect((await reader().read(await seedWorkspace(null))).hasBrandName).toBe(false);
    expect((await reader().read(await seedWorkspace("  "))).hasBrandName).toBe(false);
    expect((await reader().read(await seedWorkspace("Explore Photo"))).hasBrandName).toBe(true);
  });

  it("AC-SETUP-004 reads only the verified workspace", async () => {
    const empty = await seedWorkspace();
    const full = await seedWorkspace("Explore Photo");
    const serviceId = await addService(full, "Wedding Basic");
    await attach(full, serviceId, await addDefinition(full, "Foto edit", true));
    await addProject(full, "BOOKED");
    expect(await reader().read(empty)).toEqual({
      hasProject: false,
      activeServiceCount: 0,
      soleActiveServiceId: null,
      hasSelectionItem: false,
      hasBrandName: false,
    });
  });

  it("AC-SETUP-019 answers every fact in one database call", async () => {
    const context = await seedWorkspace();
    const execute = vi.spyOn(db, "execute");
    await reader().read(context);
    expect(execute).toHaveBeenCalledTimes(1);
    execute.mockRestore();
  });
});
