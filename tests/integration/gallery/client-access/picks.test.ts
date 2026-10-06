import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";
import { galleryPhoto } from "@/adapters/db/schema/gallery/gallery";
import { selectionGroup } from "@/adapters/db/schema/gallery/selection";
import { createDrizzleSelectionRepository } from "@/adapters/db/selection-repository/drizzle-selection-repository";
import type { ClientContext } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access.types";
import { setPick } from "@/features/gallery/application/use-cases/set-pick/set-pick";
import { setPickNote } from "@/features/gallery/application/use-cases/set-pick-note/set-pick-note";

import { openTestDb } from "../../helpers/test-db";
import { clientContextOf } from "./client-context";
import {
  addProjectItems,
  type ClientAccessFixture,
  seedClientAccess,
  seedPhotos,
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

interface World {
  readonly client: ClientContext;
  readonly edit: string;
  readonly print: string;
  readonly photo: Record<string, string>;
  readonly sariPhoto: string;
}

/** A fresh *Wisuda Rina* with Foto edit (COUNT 3, notes) and Foto cetak (QUANTITY 2), per test. */
async function world(): Promise<World> {
  const workspaceId = fixture.context.workspaceId;
  const base = { workspaceId, serviceId: fixture.serviceId };
  const rina = await seedProjectWithGallery(db, {
    ...base,
    clientName: "Rina",
    title: "Wisuda Rina",
    status: "POST_PROCESSING",
  });
  const target = { ...rina, workspaceId };
  await addProjectItems(db, target, [
    { name: "Foto edit", value: 3, pickMode: "COUNT", allowsPickNotes: true },
    { name: "Foto cetak", value: 2, unit: "lembar", pickMode: "QUANTITY" },
  ]);
  await createDrizzleGallerySourceRepository(db).withLockedGallery(
    fixture.context,
    rina.galleryId,
    (_gallery, writer) => writer.createSelectionGroups(),
  );
  const { photoIds } = await seedPhotos(db, target, [
    ...Array.from({ length: 9 }, (_, index) => ({ fileName: `IMG_00${String(index + 1)}.jpg` })),
    { fileName: "IMG_010.jpg", missing: true },
    { fileName: "E_001.jpg", kind: "EDITED" as const },
  ]);
  const sari = await seedProjectWithGallery(db, {
    ...base,
    clientName: "Sari",
    title: "Sari",
    status: "BOOKED",
  });
  const other = await seedPhotos(db, { workspaceId, galleryId: sari.galleryId }, [
    { fileName: "S_001.jpg" },
  ]);
  const client = { ...clientContextOf(target), sessionId: crypto.randomUUID().replaceAll("-", "") };
  const [edit, print] = await createDrizzleSelectionRepository(db).listGroups(
    fixture.context,
    rina.projectId,
  );
  return {
    client,
    edit: edit.id,
    print: print.id,
    photo: photoIds,
    sariPhoto: other.photoIds["S_001.jpg"],
  };
}

const deps = () => ({
  selections: createDrizzleSelectionRepository(db),
  rateLimiter: createNeonRateLimiter(db),
});

function pick(w: World, groupId: string, name: string, quantity = 1) {
  return setPick(deps(), w.client, { groupId, photoId: w.photo[name] ?? name, quantity });
}

async function usage(w: World, groupId: string) {
  const groups = await deps().selections.listGroups(fixture.context, w.client.projectId);
  return groups.find((group) => group.id === groupId)?.usage;
}

describe("picks (D-12)", () => {
  it("AC-SEL-002 saves picks and un-picks at once", async () => {
    const w = await world();
    expect(await pick(w, w.edit, "IMG_001.jpg")).toEqual({ ok: true, usage: 1, quantity: 1 });
    expect(await pick(w, w.edit, "IMG_002.jpg")).toMatchObject({ ok: true, usage: 2 });
    expect(await pick(w, w.edit, "IMG_002.jpg", 0)).toMatchObject({ ok: true, usage: 1 });
    expect(await usage(w, w.edit)).toBe(1);
  });

  it("AC-SEL-003 refuses a pick past the limit and keeps the usage", async () => {
    const w = await world();
    for (const name of ["IMG_001.jpg", "IMG_002.jpg", "IMG_003.jpg"]) await pick(w, w.edit, name);
    expect(await pick(w, w.edit, "IMG_004.jpg")).toEqual({ ok: false, code: "LIMIT_REACHED" });
    expect(await usage(w, w.edit)).toBe(3);
  });

  it("AC-SEL-004 lets exactly one of two simultaneous picks take the last place", async () => {
    const w = await world();
    await pick(w, w.edit, "IMG_001.jpg");
    await pick(w, w.edit, "IMG_002.jpg");
    const results = await Promise.all([
      pick(w, w.edit, "IMG_003.jpg"),
      pick(w, w.edit, "IMG_004.jpg"),
    ]);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(results.filter((result) => !result.ok)).toEqual([{ ok: false, code: "LIMIT_REACHED" }]);
    expect(await usage(w, w.edit)).toBe(3);
  });

  it("AC-SEL-005 counts print quantities toward the limit", async () => {
    const w = await world();
    expect(await pick(w, w.print, "IMG_003.jpg", 2)).toMatchObject({ ok: true, usage: 2 });
    expect(await pick(w, w.print, "IMG_004.jpg", 1)).toEqual({ ok: false, code: "LIMIT_REACHED" });
    expect(await pick(w, w.print, "IMG_003.jpg", 1)).toMatchObject({ ok: true, usage: 1 });
    expect(await pick(w, w.print, "IMG_004.jpg", 1)).toMatchObject({ ok: true, usage: 2 });
  });

  it("AC-SEL-006 refuses edited files, missing photos and another project's photo", async () => {
    const w = await world();
    for (const photo of [w.photo["E_001.jpg"], w.photo["IMG_010.jpg"], w.sariPhoto]) {
      expect(
        await setPick(deps(), w.client, { groupId: w.edit, photoId: photo, quantity: 1 }),
      ).toEqual({
        ok: false,
        code: "PHOTO_NOT_SELECTABLE",
      });
    }
    expect(await usage(w, w.edit)).toBe(0);
  });

  it("AC-ACC-006 refuses a group of another project", async () => {
    const w = await world();
    const other = await world();
    expect(
      await setPick(deps(), w.client, {
        groupId: other.edit,
        photoId: w.photo["IMG_001.jpg"],
        quantity: 1,
      }),
    ).toEqual({
      ok: false,
      code: "NOT_FOUND",
    });
  });

  it("AC-SEL-007 counts one photo in two groups", async () => {
    const w = await world();
    expect((await pick(w, w.edit, "IMG_005.jpg")).ok).toBe(true);
    expect((await pick(w, w.print, "IMG_005.jpg")).ok).toBe(true);
    expect([await usage(w, w.edit), await usage(w, w.print)]).toEqual([1, 1]);
  });

  it("AC-SEL-015 keeps a picked photo that went missing and lets it be un-picked", async () => {
    const w = await world();
    await pick(w, w.edit, "IMG_001.jpg");
    await db
      .update(galleryPhoto)
      .set({ missingAt: new Date() })
      .where(eq(galleryPhoto.id, w.photo["IMG_001.jpg"]));
    expect(await usage(w, w.edit)).toBe(1);
    const picked = await deps().selections.listPickedPhotos(fixture.context, w.client.projectId);
    expect(picked.map((row) => [row.fileName, row.missing])).toEqual([["IMG_001.jpg", true]]);
    expect(await pick(w, w.edit, "IMG_001.jpg", 0)).toMatchObject({ ok: true, usage: 0 });
  });

  it("AC-SEL-021 keeps a note, refuses 501 characters, refuses notes when off and drops it on un-pick", async () => {
    const w = await world();
    await pick(w, w.edit, "IMG_002.jpg");
    const note = (groupId: string, name: string, text: string) =>
      setPickNote(deps(), w.client, { groupId, photoId: w.photo[name], note: text });
    expect(await note(w.edit, "IMG_002.jpg", " hapus jerawat, cerahkan sedikit ")).toEqual({
      ok: true,
      note: "hapus jerawat, cerahkan sedikit",
    });
    expect(await note(w.edit, "IMG_002.jpg", "a".repeat(501))).toEqual({
      ok: false,
      code: "TOO_LONG",
    });
    expect(await note(w.edit, "IMG_003.jpg", "x")).toEqual({ ok: false, code: "NOT_PICKED" });
    await pick(w, w.print, "IMG_003.jpg");
    expect(await note(w.print, "IMG_003.jpg", "x")).toEqual({ ok: false, code: "NOTES_OFF" });
    const notesOf = async () =>
      (await deps().selections.listPickedPhotos(fixture.context, w.client.projectId))
        .filter((row) => row.groupId === w.edit)
        .map((row) => row.note);
    expect(await notesOf()).toEqual(["hapus jerawat, cerahkan sedikit"]);
    await pick(w, w.edit, "IMG_002.jpg", 0);
    await pick(w, w.edit, "IMG_002.jpg");
    expect(await notesOf()).toEqual([null]);
  });

  it("BR-SEL-005 refuses picks, un-picks and notes once the group is submitted", async () => {
    const w = await world();
    await pick(w, w.edit, "IMG_001.jpg");
    await db
      .update(selectionGroup)
      .set({ status: "SUBMITTED", submittedAt: new Date() })
      .where(eq(selectionGroup.id, w.edit));
    const refused = { ok: false, code: "GROUP_NOT_OPEN" };
    expect(await pick(w, w.edit, "IMG_002.jpg")).toEqual(refused);
    expect(await pick(w, w.edit, "IMG_001.jpg", 0)).toEqual(refused);
    expect(
      await setPickNote(deps(), w.client, {
        groupId: w.edit,
        photoId: w.photo["IMG_001.jpg"],
        note: "x",
      }),
    ).toEqual(refused);
    expect(await usage(w, w.edit)).toBe(1);
  });
});
