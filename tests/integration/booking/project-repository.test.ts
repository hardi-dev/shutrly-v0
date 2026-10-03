import { uniqueEmail } from "@tests/support/auth/unique";
import { and, count, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createDrizzleItemDefinitionRepository } from "@/adapters/db/catalog-repository/drizzle-item-definition-repository";
import { createDrizzleServiceRepository } from "@/adapters/db/catalog-repository/drizzle-service-repository";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleClientRepository } from "@/adapters/db/client-repository/drizzle-client-repository";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";
import { user } from "@/adapters/db/schema/auth/auth";
import {
  service,
  serviceCategory,
  serviceFieldDefinition,
  serviceItem,
  serviceItemDefinition,
} from "@/adapters/db/schema/booking/catalog";
import { client } from "@/adapters/db/schema/booking/client";
import {
  project,
  projectFieldValue,
  projectItem,
  projectSession,
} from "@/adapters/db/schema/booking/project";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import type { ProjectSnapshotInput } from "@/features/booking/application/ports/project-repository/project-repository.port";
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
  await db.insert(user).values({ id: ownerId, name: "Project Owner", email: uniqueEmail() });
  const rows = await db
    .insert(workspace)
    .values({ ownerUserId: ownerId, name: `Project ${crypto.randomUUID()}`, invoicePrefix: "PRJ" })
    .returning({ id: workspace.id });
  const id = rows.at(0)?.id;
  if (!id) throw new Error("workspace insert returned no row");
  return { workspaceId: asWorkspaceId(id), ownerId };
}

async function seedCatalog(workspaceId: string, ownerId: string) {
  const [category] = await db
    .insert(serviceCategory)
    .values({ workspaceId, name: "Wisuda", updatedBy: ownerId })
    .returning({ id: serviceCategory.id });
  const [fotoEdit, jumlahOrang, albumLama] = await db
    .insert(serviceItemDefinition)
    .values([
      {
        workspaceId,
        name: "Foto edit",
        valueType: "NUMBER",
        unit: "foto",
        selectionRequired: true,
        selectionType: "EDIT",
      },
      { workspaceId, name: "Jumlah orang", valueType: "RANGE", unit: "orang" },
      { workspaceId, name: "Album lama", valueType: "NUMBER", isActive: false },
    ])
    .returning({ id: serviceItemDefinition.id });
  const [active, archived] = await db
    .insert(service)
    .values([
      { workspaceId, categoryId: category.id, name: "Wisuda Basic", basePrice: "750000" },
      {
        workspaceId,
        categoryId: category.id,
        name: "Prewed Lama",
        basePrice: "1500000",
        isActive: false,
      },
    ])
    .returning({ id: service.id });
  await db.insert(serviceItem).values([
    {
      workspaceId,
      serviceId: active.id,
      definitionId: fotoEdit.id,
      value: { type: "NUMBER", value: "25" },
      sortOrder: 0,
    },
    {
      workspaceId,
      serviceId: active.id,
      definitionId: jumlahOrang.id,
      value: { type: "RANGE", min: "1", max: "3" },
      sortOrder: 1,
    },
  ]);
  await db.insert(serviceFieldDefinition).values([
    {
      workspaceId,
      serviceId: active.id,
      key: "nama_kampus",
      name: "Nama kampus",
      fieldType: "TEXT",
      isRequired: true,
      sortOrder: 0,
    },
    {
      workspaceId,
      serviceId: active.id,
      key: "tanggal_wisuda",
      name: "Tanggal wisuda",
      fieldType: "DATE",
      isRequired: true,
      sortOrder: 1,
    },
    {
      workspaceId,
      serviceId: active.id,
      key: "ukuran_toga",
      name: "Ukuran toga",
      fieldType: "SELECT",
      isRequired: false,
      options: ["S", "M", "L"],
      sortOrder: 2,
    },
  ]);
  const [rina, budi] = await db
    .insert(client)
    .values([
      { workspaceId, name: "Rina", whatsappNumber: "6281234567890" },
      { workspaceId, name: "Budi", archivedAt: new Date() },
    ])
    .returning({ id: client.id });
  return {
    rina: rina.id,
    budi: budi.id,
    active: active.id,
    archived: archived.id,
    fotoEdit: fotoEdit.id,
    jumlahOrang: jumlahOrang.id,
    albumLama: albumLama.id,
  };
}

function snapshot(
  ids: Awaited<ReturnType<typeof seedCatalog>>,
  ownerId: string,
  overrides: Partial<ProjectSnapshotInput> = {},
): ProjectSnapshotInput {
  return {
    status: "BOOKED",
    clientId: ids.rina,
    serviceId: ids.active,
    title: "Wisuda Basic — Rina",
    notes: null,
    agreedPrice: "750000",
    accessToken: Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url"),
    actorId: ownerId,
    items: [
      { definitionId: ids.fotoEdit, value: { type: "NUMBER", value: "25" } },
      { definitionId: ids.jumlahOrang, value: { type: "RANGE", min: "1", max: "3" } },
    ],
    fieldValues: { nama_kampus: "Universitas Indonesia", tanggal_wisuda: "2026-11-10" },
    sessions: [
      {
        name: "Wisuda",
        date: "2026-11-10",
        startTime: "07:30",
        endTime: "10:00",
        location: "Balairung UI, Depok",
      },
    ],
    ...overrides,
  };
}

describe("Drizzle project repository", () => {
  it("AC-PRJ-008 writes the project, items, field values and sessions in one transaction", async () => {
    const context = await seedWorkspace();
    const ids = await seedCatalog(context.workspaceId, context.ownerId);
    const repository = createDrizzleProjectRepository(db);
    const first = await repository.createSnapshot(context, snapshot(ids, context.ownerId));
    const second = await repository.createSnapshot(context, snapshot(ids, context.ownerId));
    if (first.status !== "CREATED" || second.status !== "CREATED") throw new Error("not created");
    const rows = await db
      .select()
      .from(project)
      .where(eq(project.workspaceId, context.workspaceId));
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ currency: "IDR", status: "BOOKED" });
    expect(rows[0].clientAccessToken).toHaveLength(43);
    expect(rows[0].clientAccessToken).not.toBe(rows[1].clientAccessToken);
    const where = (table: typeof projectItem | typeof projectFieldValue | typeof projectSession) =>
      and(eq(table.workspaceId, context.workspaceId), eq(table.projectId, first.id));
    expect(
      (await db.select({ n: count() }).from(projectItem).where(where(projectItem)))[0]?.n,
    ).toBe(2);
    expect(
      (await db.select({ n: count() }).from(projectSession).where(where(projectSession)))[0]?.n,
    ).toBe(1);
    const fields = await db.select().from(projectFieldValue).where(where(projectFieldValue));
    expect(fields).toHaveLength(3);
    expect(fields.find((field) => field.fieldKey === "ukuran_toga")?.value).toBeNull();
  });

  it("AC-PRJ-012 refuses an archived client and an archived service and writes nothing", async () => {
    const context = await seedWorkspace();
    const ids = await seedCatalog(context.workspaceId, context.ownerId);
    const repository = createDrizzleProjectRepository(db);
    expect(
      await repository.createSnapshot(
        context,
        snapshot(ids, context.ownerId, { clientId: ids.budi }),
      ),
    ).toEqual({ status: "CLIENT_INACTIVE" });
    expect(
      await repository.createSnapshot(
        context,
        snapshot(ids, context.ownerId, { serviceId: ids.archived }),
      ),
    ).toEqual({ status: "SERVICE_INACTIVE" });
    expect(
      await repository.createSnapshot(
        context,
        snapshot(ids, context.ownerId, {
          items: [{ definitionId: ids.albumLama, value: { type: "NUMBER", value: "1" } }],
        }),
      ),
    ).toEqual({ status: "DEFINITION_INACTIVE", definitionId: ids.albumLama });
    expect(
      (
        await db
          .select({ n: count() })
          .from(project)
          .where(eq(project.workspaceId, context.workspaceId))
      )[0]?.n,
    ).toBe(0);
  });

  it("AC-PRJ-012 treats another workspace's service as not found", async () => {
    const workspaceA = await seedWorkspace();
    const workspaceB = await seedWorkspace();
    const idsA = await seedCatalog(workspaceA.workspaceId, workspaceA.ownerId);
    const idsB = await seedCatalog(workspaceB.workspaceId, workspaceB.ownerId);
    const repository = createDrizzleProjectRepository(db);
    expect(
      await repository.createSnapshot(
        workspaceA,
        snapshot(idsA, workspaceA.ownerId, { serviceId: idsB.active }),
      ),
    ).toEqual({ status: "NOT_FOUND" });
    expect(await repository.findServiceForSnapshot(workspaceA, idsB.active)).toBeNull();
  });

  it("AC-PRJ-025 findDetail returns the snapshot and never the access token", async () => {
    const context = await seedWorkspace();
    const ids = await seedCatalog(context.workspaceId, context.ownerId);
    const repository = createDrizzleProjectRepository(db);
    const created = await repository.createSnapshot(context, snapshot(ids, context.ownerId));
    if (created.status !== "CREATED") throw new Error("not created");
    const detail = await repository.findDetail(context, created.id);
    expect(detail).toMatchObject({
      title: "Wisuda Basic — Rina",
      agreedPrice: "750000",
      status: "BOOKED",
      client: { name: "Rina", whatsappNumber: "6281234567890" },
      service: { name: "Wisuda Basic" },
      cancellation: null,
    });
    expect(detail?.items.map((item) => item.name)).toEqual(["Foto edit", "Jumlah orang"]);
    expect(detail?.sessions[0]).toMatchObject({ startTime: "07:30", endTime: "10:00" });
    expect(JSON.stringify(detail)).not.toContain("clientAccessToken");
    expect(Object.keys(detail ?? {})).not.toContain("clientAccessToken");
    const other = await seedWorkspace();
    expect(await repository.findDetail(other, created.id)).toBeNull();
  });

  it("AC-PRJ-006 lists active services and searches active clients with a project count", async () => {
    const context = await seedWorkspace();
    const ids = await seedCatalog(context.workspaceId, context.ownerId);
    const repository = createDrizzleProjectRepository(db);
    await repository.createSnapshot(context, snapshot(ids, context.ownerId));
    const groups = await repository.listActiveServiceOptions(context);
    expect(groups.flatMap((group) => group.services.map((row) => row.name))).toEqual([
      "Wisuda Basic",
    ]);
    expect(groups[0]?.services[0]?.fields.map((field) => field.key)).toEqual([
      "nama_kampus",
      "tanggal_wisuda",
      "ukuran_toga",
    ]);
    expect(await repository.searchActiveClients(context, "rin", 8)).toEqual([
      { id: ids.rina, name: "Rina", whatsappNumber: "6281234567890", projectCount: 1 },
    ]);
    expect(await repository.searchActiveClients(context, "Budi", 8)).toEqual([]);
  });

  it("AC-PRJ-024 blocks deleting a client, service or definition a project uses", async () => {
    const context = await seedWorkspace();
    const ids = await seedCatalog(context.workspaceId, context.ownerId);
    const repository = createDrizzleProjectRepository(db);
    await repository.createSnapshot(context, snapshot(ids, context.ownerId));
    expect(await createDrizzleClientRepository(db).delete(context, ids.rina)).toBe("IN_USE");
    expect(await createDrizzleServiceRepository(db).delete(context, ids.active)).toBe("IN_USE");
    expect(await createDrizzleItemDefinitionRepository(db).delete(context, ids.fotoEdit)).toBe(
      "IN_USE",
    );
  });
});
