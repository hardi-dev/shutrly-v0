import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { selectionGroup } from "@/adapters/db/schema/gallery/selection";
import { setPick } from "@/features/gallery/application/use-cases/set-pick/set-pick";
import { submitSelectionGroup } from "@/features/gallery/application/use-cases/submit-selection-group/submit-selection-group";

import { openTestDb } from "../../helpers/test-db";
import { type ClientAccessFixture, seedClientAccess } from "./fixture";
import { groupUsage, seedWorld, selectionDeps, type World } from "./selection-world";

let db: Db;
let close: () => Promise<void>;
let fixture: ClientAccessFixture;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
  fixture = await seedClientAccess(db);
});
afterAll(() => close());

const world = () => seedWorld(db, fixture);
const deps = () => selectionDeps(db);
const pick = (w: World, groupId: string, name: string, quantity = 1) =>
  setPick(deps(), w.client, { groupId, photoId: w.photo[name], quantity });
const submit = (w: World, groupId: string, confirmBelowLimit: boolean) =>
  submitSelectionGroup(deps(), w.client, { groupId, confirmBelowLimit }, new Date());

async function statusOf(groupId: string) {
  const [row] = await db
    .select({ status: selectionGroup.status, submittedAt: selectionGroup.submittedAt })
    .from(selectionGroup)
    .where(eq(selectionGroup.id, groupId));
  return row;
}

describe("submit a group (D-13, BR-SEL-005/006)", () => {
  it("AC-SEL-008 asks to confirm below the limit, then submits and refuses every later change", async () => {
    const w = await world();
    await pick(w, w.edit, "IMG_001.jpg");
    await pick(w, w.edit, "IMG_002.jpg");
    expect(await submit(w, w.edit, false)).toEqual({
      ok: false,
      code: "NEEDS_CONFIRMATION",
      remaining: 1,
    });
    expect((await statusOf(w.edit)).status).toBe("OPEN");
    expect(await submit(w, w.edit, true)).toEqual({ ok: true, groupName: "Foto edit", usage: 2 });
    const stored = await statusOf(w.edit);
    expect(stored.status).toBe("SUBMITTED");
    expect(stored.submittedAt).not.toBeNull();
    const refused = { ok: false, code: "GROUP_NOT_OPEN" };
    expect(await pick(w, w.edit, "IMG_003.jpg")).toEqual(refused);
    expect(await pick(w, w.edit, "IMG_001.jpg", 0)).toEqual(refused);
    expect(await submit(w, w.edit, true)).toEqual(refused);
    expect(await groupUsage(db, fixture, w, w.edit)).toBe(2);
  });

  it("AC-SEL-008 submits a full group without a confirmation", async () => {
    const w = await world();
    for (const name of ["IMG_001.jpg", "IMG_002.jpg", "IMG_003.jpg"]) await pick(w, w.edit, name);
    expect(await submit(w, w.edit, false)).toMatchObject({ ok: true, usage: 3 });
  });

  it("AC-SEL-009 refuses a group with no picks and leaves it open", async () => {
    const w = await world();
    expect(await submit(w, w.print, true)).toEqual({ ok: false, code: "NO_PICKS" });
    expect((await statusOf(w.print)).status).toBe("OPEN");
  });

  it("AC-SEL-018 raises a print quantity up to the places left, refuses 3, and removing it blocks Kirim", async () => {
    const w = await world();
    expect(await pick(w, w.print, "IMG_003.jpg")).toMatchObject({ ok: true, usage: 1 });
    expect(await pick(w, w.print, "IMG_003.jpg", 2)).toMatchObject({ ok: true, usage: 2 });
    expect(await pick(w, w.print, "IMG_003.jpg", 3)).toEqual({ ok: false, code: "LIMIT_REACHED" });
    expect(await pick(w, w.print, "IMG_003.jpg", 0)).toMatchObject({ ok: true, usage: 0 });
    expect(await groupUsage(db, fixture, w, w.print)).toBe(0);
    expect(await submit(w, w.print, true)).toEqual({ ok: false, code: "NO_PICKS" });
  });

  it("BR-SEL-006 lets exactly one of two simultaneous submits win", async () => {
    const w = await world();
    await pick(w, w.edit, "IMG_001.jpg");
    const results = await Promise.all([submit(w, w.edit, true), submit(w, w.edit, true)]);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(results.filter((result) => !result.ok)).toEqual([{ ok: false, code: "GROUP_NOT_OPEN" }]);
  });

  it("AC-ACC-006 refuses another project's group", async () => {
    const w = await world();
    const other = await world();
    await pick(other, other.edit, "IMG_001.jpg");
    expect(await submit(w, other.edit, true)).toEqual({ ok: false, code: "NOT_FOUND" });
    expect((await statusOf(other.edit)).status).toBe("OPEN");
  });
});
