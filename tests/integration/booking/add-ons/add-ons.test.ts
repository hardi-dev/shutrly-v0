import { and, eq, sum } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { projectAddOn } from "@/adapters/db/schema/booking/add-on";
import { selectionGroup } from "@/adapters/db/schema/gallery/selection";
import {
  approveAddOnWithLimit,
  cancelAddOnWithLimit,
  createAddOnWithTarget,
} from "@/composition/booking/add-on-edits/add-on-edits";
import { runAddOnTransaction } from "@/composition/booking/add-on-scope/add-on-scope";
import { setPick } from "@/features/gallery/application/use-cases/set-pick/set-pick";
import { submitSelectionGroup } from "@/features/gallery/application/use-cases/submit-selection-group/submit-selection-group";

import { type ClientAccessFixture, seedClientAccess } from "../../gallery/client-access/fixture";
import { seedWorld, selectionDeps, type World } from "../../gallery/client-access/selection-world";
import { openTestDb } from "../../helpers/test-db";

let db: Db;
let close: () => Promise<void>;
let fixture: ClientAccessFixture;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
  fixture = await seedClientAccess(db);
});
afterAll(() => close());

const NOW = new Date("2026-10-07T09:00:00Z");
const targetOf = (w: World) => ({
  context: fixture.context,
  actorId: fixture.ownerId,
  projectId: w.client.projectId,
  now: NOW,
});

async function create(w: World, values: Record<string, unknown>) {
  const result = await runAddOnTransaction(db, (scope) =>
    createAddOnWithTarget(scope, targetOf(w), values),
  );
  if (!result.ok) throw new Error(`create failed: ${JSON.stringify(result)}`);
  return result.addOnId;
}
const approve = (w: World, addOnId: string) =>
  runAddOnTransaction(db, (scope) => approveAddOnWithLimit(scope, targetOf(w), { addOnId }));
const cancel = (w: World, addOnId: string) =>
  runAddOnTransaction(db, (scope) => cancelAddOnWithLimit(scope, targetOf(w), { addOnId }));
const pick = (w: World, groupId: string, names: readonly string[]) =>
  Promise.all(
    names.map((name) =>
      setPick(selectionDeps(db), w.client, { groupId, photoId: w.photo[name], quantity: 1 }),
    ),
  );
const pickOne = (w: World, groupId: string, name: string, quantity = 1) =>
  setPick(selectionDeps(db), w.client, { groupId, photoId: w.photo[name], quantity });
const submit = (w: World, groupId: string) =>
  submitSelectionGroup(selectionDeps(db), w.client, { groupId, confirmBelowLimit: true }, NOW);

async function groupOf(w: World, groupId: string) {
  const groups = await selectionDeps(db).selections.listGroups(fixture.context, w.client.projectId);
  const group = groups.find((candidate) => candidate.id === groupId);
  if (!group) throw new Error("group missing");
  return group;
}

async function addOnRow(addOnId: string) {
  const [row] = await db.select().from(projectAddOn).where(eq(projectAddOn.id, addOnId));
  return row;
}

/** BR-SEL-002: the stored extra_limit always equals the sum of approved add-ons on the group. */
async function expectExtraIsSumOfApproved(groupId: string) {
  const [approved] = await db
    .select({ total: sum(projectAddOn.quantity) })
    .from(projectAddOn)
    .where(and(eq(projectAddOn.selectionGroupId, groupId), eq(projectAddOn.status, "APPROVED")));
  const [group] = await db
    .select({ extra: selectionGroup.extraLimit })
    .from(selectionGroup)
    .where(eq(selectionGroup.id, groupId));
  expect(group.extra).toBe(Number(approved.total ?? 0));
}

const FIVE_EDITS = (w: World) => ({
  description: "Tambahan 5 foto edit",
  selectionGroupId: w.edit,
  quantity: "5",
  unitPrice: "20.000",
});

describe("add-ons (D-16, ADR-016)", () => {
  it("AC-ADD-001 approving a 5-photo add-on gives 3 / 8, with the total, actor and time; no invoice", async () => {
    const w = await seedWorld(db, fixture);
    await pick(w, w.edit, ["IMG_001.jpg", "IMG_002.jpg", "IMG_003.jpg"]);
    const addOnId = await create(w, FIVE_EDITS(w));
    const draft = await addOnRow(addOnId);
    expect(draft.status).toBe("DRAFT");
    expect(draft.totalAmount).toBe("100000.000");
    expect((await groupOf(w, w.edit)).extraLimit).toBe(0);
    await expectExtraIsSumOfApproved(w.edit);

    expect(await approve(w, addOnId)).toBeUndefined();
    const approved = await addOnRow(addOnId);
    expect(approved.status).toBe("APPROVED");
    expect(approved.approvedBy).toBe(fixture.ownerId);
    expect(approved.approvedAt?.toISOString()).toBe(NOW.toISOString());
    const group = await groupOf(w, w.edit);
    expect([group.usage, group.baseLimit + group.extraLimit]).toEqual([3, 8]);
    await expectExtraIsSumOfApproved(w.edit);

    expect(await approve(w, addOnId)).toBeUndefined();
    expect((await groupOf(w, w.edit)).extraLimit).toBe(5);
  });

  it("AC-ADD-002 refuses a locked target and a group of another project", async () => {
    const w = await seedWorld(db, fixture);
    const other = await seedWorld(db, fixture);
    await db
      .update(selectionGroup)
      .set({ status: "LOCKED", lockedAt: NOW })
      .where(eq(selectionGroup.id, w.print));
    for (const [groupId, key] of [
      [w.print, "TARGET_LOCKED"],
      [other.edit, "NOT_AN_OPTION"],
    ] as const) {
      const result = await runAddOnTransaction(db, (scope) =>
        createAddOnWithTarget(scope, targetOf(w), { ...FIVE_EDITS(w), selectionGroupId: groupId }),
      );
      expect(result).toEqual({
        ok: false,
        code: "VALIDATION_FAILED",
        fieldErrors: { selectionGroupId: key },
      });
    }
  });

  it("AC-ADD-007 approval reopens a submitted group with its picks; the client adds 2 and submits again", async () => {
    const w = await seedWorld(db, fixture);
    await pick(w, w.edit, ["IMG_001.jpg", "IMG_002.jpg", "IMG_003.jpg"]);
    expect(await submit(w, w.edit)).toMatchObject({ ok: true });
    const addOnId = await create(w, FIVE_EDITS(w));
    expect(await approve(w, addOnId)).toBeUndefined();
    const reopened = await groupOf(w, w.edit);
    expect([reopened.status, reopened.pickCount, reopened.extraLimit]).toEqual(["OPEN", 3, 5]);
    await pick(w, w.edit, ["IMG_004.jpg", "IMG_005.jpg"]);
    expect(await submit(w, w.edit)).toMatchObject({ ok: true });
    expect((await groupOf(w, w.edit)).status).toBe("SUBMITTED");
  });

  it("AC-ADD-007 a group locked after the draft refuses the approval, and the add-on stays a draft", async () => {
    const w = await seedWorld(db, fixture);
    const addOnId = await create(w, FIVE_EDITS(w));
    await db
      .update(selectionGroup)
      .set({ status: "LOCKED", lockedAt: NOW })
      .where(eq(selectionGroup.id, w.edit));
    expect(await approve(w, addOnId)).toEqual({ ok: false, code: "TARGET_LOCKED" });
    expect((await addOnRow(addOnId)).status).toBe("DRAFT");
    expect((await groupOf(w, w.edit)).extraLimit).toBe(0);
    await expectExtraIsSumOfApproved(w.edit);
  });

  it("AC-ADD-003 an add-on without a target changes no limit", async () => {
    const w = await seedWorld(db, fixture);
    const addOnId = await create(w, {
      description: "Album tambahan",
      quantity: 1,
      unitPrice: "750000",
    });
    expect(await approve(w, addOnId)).toBeUndefined();
    const row = await addOnRow(addOnId);
    expect([row.status, row.selectionGroupId, row.totalAmount]).toEqual([
      "APPROVED",
      null,
      "750000.000",
    ]);
    const groups = await selectionDeps(db).selections.listGroups(
      fixture.context,
      w.client.projectId,
    );
    expect(groups.map((group) => group.extraLimit)).toEqual([0, 0]);
  });

  it("AC-ADD-004 the database refuses an approval without actor and time, and a total that is not quantity × price", async () => {
    const w = await seedWorld(db, fixture);
    const addOnId = await create(w, FIVE_EDITS(w));
    await expect(
      db.update(projectAddOn).set({ status: "APPROVED" }).where(eq(projectAddOn.id, addOnId)),
    ).rejects.toThrow();
    await expect(
      db.update(projectAddOn).set({ totalAmount: "1" }).where(eq(projectAddOn.id, addOnId)),
    ).rejects.toThrow();
  });

  it("AC-ADD-005 cancelling below usage is refused with the usage; after un-picks it succeeds with actor and time", async () => {
    const w = await seedWorld(db, fixture);
    const addOnId = await create(w, FIVE_EDITS(w));
    expect(await approve(w, addOnId)).toBeUndefined();
    const seven = [
      "IMG_001.jpg",
      "IMG_002.jpg",
      "IMG_003.jpg",
      "IMG_004.jpg",
      "IMG_005.jpg",
      "IMG_006.jpg",
      "IMG_007.jpg",
    ];
    for (const name of seven) await pickOne(w, w.edit, name);
    expect(await cancel(w, addOnId)).toEqual({
      ok: false,
      code: "CANCEL_BELOW_USAGE",
      usage: 7,
      limit: 3,
    });
    expect((await addOnRow(addOnId)).status).toBe("APPROVED");
    await expectExtraIsSumOfApproved(w.edit);

    for (const name of seven.slice(3)) await pickOne(w, w.edit, name, 0);
    expect(await cancel(w, addOnId)).toBeUndefined();
    const row = await addOnRow(addOnId);
    expect([row.status, row.cancelledBy, row.cancelledAt?.toISOString()]).toEqual([
      "CANCELLED",
      fixture.ownerId,
      NOW.toISOString(),
    ]);
    const group = await groupOf(w, w.edit);
    expect([group.usage, group.baseLimit + group.extraLimit]).toEqual([3, 3]);
    await expectExtraIsSumOfApproved(w.edit);
  });

  it("AC-ADD-006 invalid values are refused server-side with field errors and nothing is stored", async () => {
    const w = await seedWorld(db, fixture);
    const result = await runAddOnTransaction(db, (scope) =>
      createAddOnWithTarget(scope, targetOf(w), {
        description: "",
        quantity: "0",
        unitPrice: "-1",
      }),
    );
    expect(result).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { description: "EMPTY", quantity: "TOO_SMALL", unitPrice: "NEGATIVE" },
    });
    const rows = await db
      .select()
      .from(projectAddOn)
      .where(eq(projectAddOn.projectId, w.client.projectId));
    expect(rows).toHaveLength(0);
  });
});
