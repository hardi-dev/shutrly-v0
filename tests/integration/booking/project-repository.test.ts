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
        team: [],
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

  it("AC-PRJ-020 AC-PRJ-021 lets exactly one of two concurrent steps win", async () => {
    const context = await seedWorkspace();
    const ids = await seedCatalog(context.workspaceId, context.ownerId);
    const repository = createDrizzleProjectRepository(db);
    const created = await repository.createSnapshot(context, snapshot(ids, context.ownerId));
    if (created.status !== "CREATED") throw new Error("not created");
    const transition = { from: "BOOKED", to: "SHOOTING" } as const;
    const results = await Promise.all([
      repository.moveStatus(context, created.id, transition, context.ownerId),
      repository.moveStatus(context, created.id, transition, context.ownerId),
    ]);
    expect(results).toContain("MOVED");
    expect(results).toContain("STALE");
    expect((await repository.findDetail(context, created.id))?.status).toBe("SHOOTING");
  });

  it("AC-PRJ-025 does not move or count another workspace's project", async () => {
    const context = await seedWorkspace();
    const other = await seedWorkspace();
    const ids = await seedCatalog(context.workspaceId, context.ownerId);
    const repository = createDrizzleProjectRepository(db);
    const created = await repository.createSnapshot(context, snapshot(ids, context.ownerId));
    if (created.status !== "CREATED") throw new Error("not created");
    const transition = { from: "BOOKED", to: "SHOOTING" } as const;
    expect(await repository.moveStatus(other, created.id, transition, other.ownerId)).toBe(
      "NOT_FOUND",
    );
    expect(await repository.countSessions(other, created.id)).toBeNull();
    expect(await repository.countSessions(context, created.id)).toBe(1);
  });

  it("AC-PRJ-016 keeps the project unchanged when the catalog is edited afterwards", async () => {
    const context = await seedWorkspace();
    const ids = await seedCatalog(context.workspaceId, context.ownerId);
    const repository = createDrizzleProjectRepository(db);
    const created = await repository.createSnapshot(context, snapshot(ids, context.ownerId));
    if (created.status !== "CREATED") throw new Error("not created");
    const before = await repository.findDetail(context, created.id);
    await db
      .update(service)
      .set({ name: "Wisuda Premium", basePrice: "9000000" })
      .where(eq(service.id, ids.active));
    await db
      .update(serviceItemDefinition)
      .set({ name: "Foto retouch" })
      .where(eq(serviceItemDefinition.id, ids.fotoEdit));
    await db
      .update(serviceFieldDefinition)
      .set({ name: "Kampus" })
      .where(
        and(
          eq(serviceFieldDefinition.serviceId, ids.active),
          eq(serviceFieldDefinition.key, "nama_kampus"),
        ),
      );
    const after = await repository.findDetail(context, created.id);
    expect(after?.items).toEqual(before?.items);
    expect(after?.fields).toEqual(before?.fields);
    expect(after?.agreedPrice).toBe("750000");
    expect(after?.items.map((item) => item.name)).toEqual(["Foto edit", "Jumlah orang"]);
  });

  it("AC-PRJ-025 returns who cancelled a cancelled project", async () => {
    const context = await seedWorkspace();
    const ids = await seedCatalog(context.workspaceId, context.ownerId);
    const repository = createDrizzleProjectRepository(db);
    const created = await repository.createSnapshot(context, snapshot(ids, context.ownerId));
    if (created.status !== "CREATED") throw new Error("not created");
    await db
      .update(project)
      .set({
        status: "CANCELLED",
        cancelledAt: new Date("2026-11-04T03:00:00Z"),
        cancelledBy: context.ownerId,
        cancelReason: "wisuda diundur",
      })
      .where(eq(project.id, created.id));
    const detail = await repository.findDetail(context, created.id);
    expect(detail?.status).toBe("CANCELLED");
    expect(detail?.cancellation).toMatchObject({
      byName: "Project Owner",
      reason: "wisuda diundur",
    });
    expect(
      await repository.moveStatus(
        context,
        created.id,
        { from: "BOOKED", to: "SHOOTING" },
        context.ownerId,
      ),
    ).toBe("STALE");
  });

  it("AC-PRJ-022 cancels under the lock and findDetail returns who and why", async () => {
    const context = await seedWorkspace();
    const ids = await seedCatalog(context.workspaceId, context.ownerId);
    const repository = createDrizzleProjectRepository(db);
    const created = await repository.createSnapshot(context, snapshot(ids, context.ownerId));
    if (created.status !== "CREATED") throw new Error("not created");
    const result = await repository.withLockedProject(
      context,
      created.id,
      async (locked, writer) => {
        expect(locked).toMatchObject({ status: "BOOKED", agreedPrice: "750000", sessionCount: 1 });
        await writer.cancel({ reason: "wisuda diundur", actorId: context.ownerId });
        return "done";
      },
    );
    expect(result).toBe("done");
    const detail = await repository.findDetail(context, created.id);
    expect(detail?.status).toBe("CANCELLED");
    expect(detail?.cancellation).toMatchObject({
      byName: "Project Owner",
      reason: "wisuda diundur",
    });
    expect(detail?.service.basePrice).toBe("750000");
  });

  it("AC-PRJ-017 updates title, notes and price through the writer", async () => {
    const context = await seedWorkspace();
    const ids = await seedCatalog(context.workspaceId, context.ownerId);
    const repository = createDrizzleProjectRepository(db);
    const created = await repository.createSnapshot(context, snapshot(ids, context.ownerId));
    if (created.status !== "CREATED") throw new Error("not created");
    await repository.withLockedProject(context, created.id, (_locked, writer) =>
      writer.updateInfo({
        title: "Judul baru",
        notes: "catatan",
        agreedPrice: "800000",
        actorId: context.ownerId,
      }),
    );
    const detail = await repository.findDetail(context, created.id);
    expect(detail).toMatchObject({ title: "Judul baru", notes: "catatan", agreedPrice: "800000" });
  });

  it("AC-PRJ-023 deletes a draft with its items, fields and sessions", async () => {
    const context = await seedWorkspace();
    const ids = await seedCatalog(context.workspaceId, context.ownerId);
    const repository = createDrizzleProjectRepository(db);
    const created = await repository.createSnapshot(
      context,
      snapshot(ids, context.ownerId, { status: "DRAFT" }),
    );
    if (created.status !== "CREATED") throw new Error("not created");
    await repository.withLockedProject(context, created.id, (_locked, writer) =>
      writer.deleteProject(),
    );
    expect(await repository.findDetail(context, created.id)).toBeNull();
    const rowsOf = async (
      table: typeof projectItem | typeof projectFieldValue | typeof projectSession,
    ) => (await db.select({ n: count() }).from(table).where(eq(table.projectId, created.id)))[0]?.n;
    expect(await rowsOf(projectItem)).toBe(0);
    expect(await rowsOf(projectFieldValue)).toBe(0);
    expect(await rowsOf(projectSession)).toBe(0);
  });

  it("AC-PRJ-025 does not lock or change another workspace's project", async () => {
    const context = await seedWorkspace();
    const other = await seedWorkspace();
    const ids = await seedCatalog(context.workspaceId, context.ownerId);
    const repository = createDrizzleProjectRepository(db);
    const created = await repository.createSnapshot(context, snapshot(ids, context.ownerId));
    if (created.status !== "CREATED") throw new Error("not created");
    expect(
      await repository.withLockedProject(other, created.id, (_locked, writer) =>
        writer.deleteProject(),
      ),
    ).toBe("NOT_FOUND");
    expect(await repository.findDetail(context, created.id)).not.toBeNull();
  });

  it("AC-PRJ-017 adds, edits and removes items and field values through the writer", async () => {
    const context = await seedWorkspace();
    const ids = await seedCatalog(context.workspaceId, context.ownerId);
    const repository = createDrizzleProjectRepository(db);
    const created = await repository.createSnapshot(context, snapshot(ids, context.ownerId));
    if (created.status !== "CREATED") throw new Error("not created");
    const outcomes = await repository.withLockedProject(context, created.id, async (_l, writer) => {
      const added = await writer.addItem({
        definitionId: ids.albumLama,
        value: { type: "NUMBER", value: "1" },
        actorId: context.ownerId,
      });
      const duplicate = await writer.addItem({
        definitionId: ids.fotoEdit,
        value: { type: "NUMBER", value: "1" },
        actorId: context.ownerId,
      });
      const item = await writer.findItem(
        (await repository.findDetail(context, created.id))?.items[0]?.id ?? "",
      );
      if (item)
        await writer.updateItemValue(item.id, { type: "NUMBER", value: "30" }, context.ownerId);
      await writer.updateFieldValues({ ukuran_toga: "M" }, context.ownerId);
      return { added, duplicate, listed: (await writer.listFields()).length };
    });
    expect(outcomes).toEqual({
      added: "DEFINITION_INACTIVE",
      duplicate: "DUPLICATE_DEFINITION",
      listed: 3,
    });
    const detail = await repository.findDetail(context, created.id);
    expect(detail?.items[0]?.value).toEqual({ type: "NUMBER", value: "30" });
    expect(detail?.fields.find((field) => field.key === "ukuran_toga")?.value).toBe("M");
    await repository.withLockedProject(context, created.id, (_l, writer) =>
      writer.removeItem(detail?.items[0]?.id ?? ""),
    );
    expect((await repository.findDetail(context, created.id))?.items).toHaveLength(1);
  });

  it("AC-PRJ-029 adds, changes and deletes sessions through the writer", async () => {
    const context = await seedWorkspace();
    const ids = await seedCatalog(context.workspaceId, context.ownerId);
    const repository = createDrizzleProjectRepository(db);
    const created = await repository.createSnapshot(context, snapshot(ids, context.ownerId));
    if (created.status !== "CREATED") throw new Error("not created");
    const extra = {
      name: "Foto",
      date: "2026-11-09",
      startTime: "06:30",
      endTime: null,
      location: null,
    };
    await repository.withLockedProject(context, created.id, (_l, writer) =>
      writer.addSession(extra, context.ownerId),
    );
    const sessions = (await repository.findDetail(context, created.id))?.sessions ?? [];
    expect(sessions.map((session) => session.name)).toEqual(["Foto", "Wisuda"]);
    const changed = await repository.withLockedProject(context, created.id, (_l, writer) =>
      writer.updateSession(sessions[0]?.id ?? "", { ...extra, name: "Foto baru" }, context.ownerId),
    );
    expect(changed).toBe(true);
    const removed = await repository.withLockedProject(context, created.id, (_l, writer) =>
      writer.deleteSession(sessions[1]?.id ?? ""),
    );
    expect(removed).toBe(true);
    expect((await repository.findDetail(context, created.id))?.sessions.map((s) => s.name)).toEqual(
      ["Foto baru"],
    );
  });

  it("AC-PRJ-019 serialises a step and a deal edit: either the edit lands first or it is refused", async () => {
    const context = await seedWorkspace();
    const ids = await seedCatalog(context.workspaceId, context.ownerId);
    const repository = createDrizzleProjectRepository(db);
    const created = await repository.createSnapshot(context, snapshot(ids, context.ownerId));
    if (created.status !== "CREATED") throw new Error("not created");
    const itemId = (await repository.findDetail(context, created.id))?.items[0]?.id ?? "";
    const edit = repository.withLockedProject(context, created.id, async (locked, writer) => {
      if (locked.status !== "BOOKED") return "DEAL_LOCKED";
      await writer.updateItemValue(itemId, { type: "NUMBER", value: "30" }, context.ownerId);
      return "SAVED";
    });
    const step = repository.moveStatus(
      context,
      created.id,
      { from: "BOOKED", to: "SHOOTING" },
      context.ownerId,
    );
    const [editResult] = await Promise.all([edit, step]);
    const detail = await repository.findDetail(context, created.id);
    expect(detail?.status).toBe("SHOOTING");
    expect(detail?.items[0]?.value).toEqual(
      editResult === "SAVED" ? { type: "NUMBER", value: "30" } : { type: "NUMBER", value: "25" },
    );
  });

  it("AC-PRJ-030 stores the edited package and leaves the service template unchanged", async () => {
    const context = await seedWorkspace();
    const ids = await seedCatalog(context.workspaceId, context.ownerId);
    const [cetak] = await db
      .insert(serviceItemDefinition)
      .values({
        workspaceId: context.workspaceId,
        name: "Foto cetak",
        valueType: "NUMBER",
        unit: "foto",
        selectionRequired: true,
        selectionType: "PRINT",
      })
      .returning({ id: serviceItemDefinition.id });
    const repository = createDrizzleProjectRepository(db);
    const created = await repository.createSnapshot(
      context,
      snapshot(ids, context.ownerId, {
        items: [
          { definitionId: ids.fotoEdit, value: { type: "NUMBER", value: "30" } },
          { definitionId: cetak.id, value: { type: "NUMBER", value: "10" } },
        ],
      }),
    );
    if (created.status !== "CREATED") throw new Error("not created");
    const detail = await repository.findDetail(context, created.id);
    expect(detail?.items.map((item) => [item.name, item.value, item.selectionType])).toEqual([
      ["Foto edit", { type: "NUMBER", value: "30" }, "EDIT"],
      ["Foto cetak", { type: "NUMBER", value: "10" }, "PRINT"],
    ]);
    const template = await db
      .select({ value: serviceItem.value })
      .from(serviceItem)
      .where(eq(serviceItem.serviceId, ids.active));
    expect(template.map((row) => row.value)).toEqual([
      { type: "NUMBER", value: "25" },
      { type: "RANGE", min: "1", max: "3" },
    ]);
  });
});
