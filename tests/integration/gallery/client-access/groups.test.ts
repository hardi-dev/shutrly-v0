import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { projectAddOn } from "@/adapters/db/schema/booking/add-on";
import { serviceItemDefinition } from "@/adapters/db/schema/booking/catalog";
import { selectionGroup } from "@/adapters/db/schema/gallery/selection";
import { createDrizzleSelectionRepository } from "@/adapters/db/selection-repository/drizzle-selection-repository";
import { runDealEditTransaction } from "@/composition/booking/project-deal-edit-scope/project-deal-edit-scope";
import {
  addItemWithGroup,
  removeItemWithGroup,
  updateItemWithGroup,
} from "@/composition/booking/project-deal-edits/project-deal-edits";

import { openTestDb } from "../../helpers/test-db";
import {
  addProjectItems,
  type ClientAccessFixture,
  seedClientAccess,
  seedPhotos,
  seedPicks,
  seedProjectWithGallery,
} from "./fixture";

let db: Db;
let close: () => Promise<void>;
let fixture: ClientAccessFixture;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
  fixture = await seedClientAccess(db);
});
afterAll(() => close());

async function bookedProject() {
  const created = await seedProjectWithGallery(db, {
    workspaceId: fixture.context.workspaceId,
    serviceId: fixture.serviceId,
    clientName: "Sari",
    title: "Wisuda Sari",
    status: "BOOKED",
  });
  return { ...created, workspaceId: fixture.context.workspaceId };
}

function createGroups(galleryId: string) {
  return createDrizzleGallerySourceRepository(db).withLockedGallery(
    fixture.context,
    galleryId,
    (_gallery, writer) => writer.createSelectionGroups(),
  );
}

function listGroups(projectId: string) {
  return createDrizzleSelectionRepository(db).listGroups(fixture.context, projectId);
}

describe("selection groups (D-10)", () => {
  it("AC-SEL-016 makes one group per selection item, by type, and none twice", async () => {
    const target = await bookedProject();
    await addProjectItems(db, target, [
      { name: "Foto edit", value: 3, pickMode: "COUNT", allowsPickNotes: true },
      { name: "Foto edit bonus", value: 2, pickMode: "COUNT" },
      { name: "Foto cetak", value: 2, unit: "lembar", pickMode: "QUANTITY" },
      { name: "Bingkai", value: 1, unit: "buah", pickMode: "QUANTITY" },
      { name: "Album", value: 1, pickMode: null },
      { name: "Foto edit lama", value: 0, pickMode: "COUNT" },
    ]);
    expect(await createGroups(target.galleryId)).toBe(5);
    expect(await createGroups(target.galleryId)).toBe(0);
    const groups = await listGroups(target.projectId);
    expect(groups.map((group) => [group.name, group.mode, group.baseLimit, group.unit])).toEqual([
      ["Foto edit", "COUNT", 3, "foto"],
      ["Foto edit bonus", "COUNT", 2, "foto"],
      ["Foto cetak", "QUANTITY", 2, "lembar"],
      ["Bingkai", "QUANTITY", 1, "buah"],
      ["Foto edit lama", "COUNT", 0, "foto"],
    ]);
    expect(groups.every((group) => group.status === "OPEN" && group.usage === 0)).toBe(true);
  });

  it("AC-SEL-013 follows deal edits and refuses ones below usage", async () => {
    const target = await bookedProject();
    const items = await addProjectItems(db, target, [
      { name: "Foto edit", value: 3, pickMode: "COUNT" },
    ]);
    await createGroups(target.galleryId);
    const [group] = await listGroups(target.projectId);
    const { photoIds } = await seedPhotos(db, target, [
      { fileName: "IMG_001.jpg" },
      { fileName: "IMG_002.jpg" },
    ]);
    await seedPicks(
      db,
      { workspaceId: target.workspaceId, groupId: group.id },
      Object.values(photoIds),
    );
    const edit = {
      context: fixture.context,
      actorId: fixture.ownerId,
      projectId: target.projectId,
    };
    const run = (work: Parameters<typeof runDealEditTransaction>[1]) =>
      runDealEditTransaction(db, work);
    const value = (n: string) => ({ value: { type: "NUMBER", value: n } });
    const itemId = items["Foto edit"];

    expect(
      await run((scope) => updateItemWithGroup(scope, edit, itemId, value("5"), "id-ID")),
    ).toBeUndefined();
    expect((await listGroups(target.projectId))[0].baseLimit).toBe(5);

    expect(
      await run((scope) => updateItemWithGroup(scope, edit, itemId, value("1"), "id-ID")),
    ).toEqual({
      ok: false,
      code: "SELECTION_IN_USE",
      usage: 2,
      unit: "foto",
    });
    expect((await listGroups(target.projectId))[0].baseLimit).toBe(5);
    expect(await run((scope) => removeItemWithGroup(scope, edit, itemId))).toMatchObject({
      code: "SELECTION_IN_USE",
    });

    const [cetak] = await db
      .insert(serviceItemDefinition)
      .values({
        workspaceId: target.workspaceId,
        name: `Foto cetak ${crypto.randomUUID().slice(0, 8)}`,
        valueType: "NUMBER",
        unit: "lembar",
        selectionRequired: true,
        pickMode: "QUANTITY",
      })
      .returning({ id: serviceItemDefinition.id });
    const added = await run((scope) =>
      addItemWithGroup(
        scope,
        edit,
        {
          definitionId: cetak.id,
          value: { type: "NUMBER", value: "2" },
        },
        "id-ID",
      ),
    );
    expect(added).toBeUndefined();
    expect((await listGroups(target.projectId)).map((row) => [row.baseLimit, row.status])).toEqual([
      [5, "OPEN"],
      [2, "OPEN"],
    ]);
  });

  it("AC-SEL-013 removes the group of an item without picks", async () => {
    const target = await bookedProject();
    const items = await addProjectItems(db, target, [
      { name: "Foto edit", value: 3, pickMode: "COUNT" },
    ]);
    await createGroups(target.galleryId);
    const edit = {
      context: fixture.context,
      actorId: fixture.ownerId,
      projectId: target.projectId,
    };
    const removed = await runDealEditTransaction(db, (scope) =>
      removeItemWithGroup(scope, edit, items["Foto edit"]),
    );
    expect(removed).toBeUndefined();
    expect(await listGroups(target.projectId)).toEqual([]);
  });

  it("AC-SEL-022 refuses removing an item with an approved add-on and detaches the others", async () => {
    const target = await bookedProject();
    const items = await addProjectItems(db, target, [
      { name: "Foto edit", value: 3, pickMode: "COUNT" },
    ]);
    await createGroups(target.galleryId);
    const [group] = await listGroups(target.projectId);
    const addOn = (description: string, status: string) => ({
      workspaceId: target.workspaceId,
      projectId: target.projectId,
      selectionGroupId: group.id,
      description,
      quantity: 1,
      unitPrice: "20000",
      totalAmount: "20000",
      status,
      approvedAt: status === "DRAFT" ? null : new Date(),
      cancelledAt: status === "CANCELLED" ? new Date() : null,
    });
    const [approved] = await db
      .insert(projectAddOn)
      .values(addOn("Tambahan foto", "APPROVED"))
      .returning({ id: projectAddOn.id });
    await db.insert(projectAddOn).values([addOn("Draf", "DRAFT"), addOn("Batal", "CANCELLED")]);
    const edit = {
      context: fixture.context,
      actorId: fixture.ownerId,
      projectId: target.projectId,
    };
    const remove = () =>
      runDealEditTransaction(db, (scope) => removeItemWithGroup(scope, edit, items["Foto edit"]));

    expect(await remove()).toEqual({ ok: false, code: "SELECTION_HAS_ADD_ON" });
    expect(await listGroups(target.projectId)).toHaveLength(1);

    await db
      .update(projectAddOn)
      .set({ status: "CANCELLED", cancelledAt: new Date() })
      .where(eq(projectAddOn.id, approved.id));
    expect(await remove()).toBeUndefined();
    expect(await listGroups(target.projectId)).toEqual([]);
    const rows = await db
      .select({ status: projectAddOn.status, groupId: projectAddOn.selectionGroupId })
      .from(projectAddOn)
      .where(eq(projectAddOn.projectId, target.projectId));
    expect(rows).toHaveLength(3);
    expect(rows.every((row) => row.groupId === null)).toBe(true);
  });

  it("AC-SEL-014 refuses any value change while the group is submitted", async () => {
    const target = await bookedProject();
    const items = await addProjectItems(db, target, [
      { name: "Foto edit", value: 3, pickMode: "COUNT" },
    ]);
    await createGroups(target.galleryId);
    await db
      .update(selectionGroup)
      .set({ status: "SUBMITTED", submittedAt: new Date() })
      .where(
        and(
          eq(selectionGroup.workspaceId, target.workspaceId),
          eq(selectionGroup.projectId, target.projectId),
        ),
      );
    const edit = {
      context: fixture.context,
      actorId: fixture.ownerId,
      projectId: target.projectId,
    };
    const result = await runDealEditTransaction(db, (scope) =>
      updateItemWithGroup(
        scope,
        edit,
        items["Foto edit"],
        {
          value: { type: "NUMBER", value: "4" },
        },
        "id-ID",
      ),
    );
    expect(result).toEqual({ ok: false, code: "SELECTION_CLOSED" });
  });
});
