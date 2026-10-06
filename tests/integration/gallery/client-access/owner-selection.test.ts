import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { project } from "@/adapters/db/schema/booking/project";
import { galleryPhoto } from "@/adapters/db/schema/gallery/gallery";
import { selectionGroup } from "@/adapters/db/schema/gallery/selection";
import { createDrizzleSelectionOwnerReader } from "@/adapters/db/selection-repository/drizzle-selection-owner-reader";
import { GalleryError } from "@/features/gallery/application/errors/gallery-errors/gallery-errors";
import { getReview } from "@/features/gallery/application/use-cases/get-review/get-review";
import { getSelectionCard } from "@/features/gallery/application/use-cases/get-selection-card/get-selection-card";
import { getSelectionGroupDetail } from "@/features/gallery/application/use-cases/get-selection-group-detail/get-selection-group-detail";
import { listSelectionGroups } from "@/features/gallery/application/use-cases/list-selection-groups/list-selection-groups";
import { lockSelectionGroup } from "@/features/gallery/application/use-cases/lock-selection-group/lock-selection-group";
import { setPick } from "@/features/gallery/application/use-cases/set-pick/set-pick";
import { setPickNote } from "@/features/gallery/application/use-cases/set-pick-note/set-pick-note";
import { submitSelectionGroup } from "@/features/gallery/application/use-cases/submit-selection-group/submit-selection-group";
import { formatPickList } from "@/features/gallery/domain/pick-list/pick-list";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { openTestDb } from "../../helpers/test-db";
import { type ClientAccessFixture, seedClientAccess } from "./fixture";
import { seedWorld, selectionDeps, type World } from "./selection-world";

let db: Db;
let close: () => Promise<void>;
let fixture: ClientAccessFixture;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
  fixture = await seedClientAccess(db);
});
afterAll(() => close());

const world = () => seedWorld(db, fixture);
const owner = () => ({ ...selectionDeps(db), owner: createDrizzleSelectionOwnerReader(db) });
const pick = (w: World, groupId: string, name: string, quantity = 1) =>
  setPick(selectionDeps(db), w.client, { groupId, photoId: w.photo[name], quantity });
const submit = (w: World, groupId: string) =>
  submitSelectionGroup(
    selectionDeps(db),
    w.client,
    { groupId, confirmBelowLimit: true },
    new Date(),
  );
const lock = (w: World, groupId: string, intent: "LOCK" | "CLOSE") =>
  lockSelectionGroup(
    { selections: selectionDeps(db).selections, now: new Date() },
    fixture.context,
    fixture.ownerId,
    w.client.projectId,
    { groupId, intent },
  );

async function statusRow(groupId: string) {
  const [row] = await db
    .select({
      status: selectionGroup.status,
      lockedAt: selectionGroup.lockedAt,
      lockedBy: selectionGroup.lockedBy,
    })
    .from(selectionGroup)
    .where(eq(selectionGroup.id, groupId));
  return row;
}

describe("owner reviews picks (A-6, A-34)", () => {
  it("AC-SEL-010 shows each group's status and usage, the picks with folder and note, and the copy text", async () => {
    const w = await world();
    await pick(w, w.edit, "IMG_001.jpg");
    await pick(w, w.edit, "IMG_002.jpg");
    await setPickNote(selectionDeps(db), w.client, {
      groupId: w.edit,
      photoId: w.photo["IMG_002.jpg"],
      note: "hapus jerawat",
    });
    await pick(w, w.print, "IMG_003.jpg", 2);
    await submit(w, w.edit);
    const projectId = w.client.projectId;

    const card = await getSelectionCard(owner(), fixture.context, projectId);
    expect(card.state).toBe("REVIEW");
    expect(card.groups.map((g) => [g.name, g.status, g.usage, g.limit, g.noteCount])).toEqual([
      ["Foto edit", "SUBMITTED", 2, 3, 1],
      ["Foto cetak", "OPEN", 2, 2, 0],
    ]);

    const page = await listSelectionGroups(owner(), fixture.context, projectId);
    expect(page.groups[0].preview.photoIds).toEqual([
      w.photo["IMG_001.jpg"],
      w.photo["IMG_002.jpg"],
    ]);
    expect(page.groups[0].preview.more).toBe(0);

    const edit = await getSelectionGroupDetail(owner(), fixture.context, projectId, w.edit);
    expect(edit.picks.map((p) => [p.fileName, p.note])).toEqual([
      ["IMG_001.jpg", null],
      ["IMG_002.jpg", "hapus jerawat"],
    ]);
    expect(formatPickList(edit.group.mode, edit.picks)).toBe(
      "IMG_001.jpg\nIMG_002.jpg — hapus jerawat",
    );
    const print = await getSelectionGroupDetail(owner(), fixture.context, projectId, w.print);
    expect(formatPickList(print.group.mode, print.picks)).toBe("IMG_003.jpg × 2");
  });

  it("AC-SEL-015 flags a picked photo that went missing and still counts it", async () => {
    const w = await world();
    await pick(w, w.edit, "IMG_001.jpg");
    await db
      .update(galleryPhoto)
      .set({ missingAt: new Date() })
      .where(eq(galleryPhoto.id, w.photo["IMG_001.jpg"]));
    const detail = await getSelectionGroupDetail(
      owner(),
      fixture.context,
      w.client.projectId,
      w.edit,
    );
    expect(detail.group.usage).toBe(1);
    expect(detail.picks.map((p) => [p.fileName, p.missing])).toEqual([["IMG_001.jpg", true]]);
    expect(detail.missingNames).toEqual(["IMG_001.jpg"]);
    const page = await listSelectionGroups(owner(), fixture.context, w.client.projectId);
    expect(page.groups[0].preview.photoIds).toEqual([]);
  });
});

describe("owner locks or closes a group (D-13, BR-SEL-005, BR-AUD-001)", () => {
  it("AC-SEL-011 locks a submitted group and closes an open one, recording who and when, and the client sees both read-only", async () => {
    const w = await world();
    await pick(w, w.edit, "IMG_001.jpg");
    await pick(w, w.print, "IMG_003.jpg");
    await submit(w, w.edit);
    expect(await lock(w, w.edit, "LOCK")).toEqual({ ok: true, groupName: "Foto edit" });
    expect(await lock(w, w.print, "CLOSE")).toEqual({ ok: true, groupName: "Foto cetak" });
    for (const id of [w.edit, w.print]) {
      const row = await statusRow(id);
      expect(row.status).toBe("LOCKED");
      expect(row.lockedAt).not.toBeNull();
      expect(row.lockedBy).toBe(fixture.ownerId);
    }
    const card = await getSelectionCard(owner(), fixture.context, w.client.projectId);
    expect(card.state).toBe("FINAL");
    const review = await getReview(
      { selections: selectionDeps(db).selections, directImages: false },
      w.client,
      w.print,
    );
    if (review.kind !== "VIEW") throw new Error("expected a view");
    expect(review.view.isEditable).toBe(false);
    expect(review.view.picks).toHaveLength(1);
    expect(await pick(w, w.print, "IMG_004.jpg")).toEqual({ ok: false, code: "GROUP_NOT_OPEN" });
    expect(await pick(w, w.print, "IMG_003.jpg", 0)).toEqual({ ok: false, code: "GROUP_NOT_OPEN" });
  });

  it("AC-SEL-011 never reopens a locked group and refuses the wrong action for a status", async () => {
    const w = await world();
    await pick(w, w.edit, "IMG_001.jpg");
    expect(await lock(w, w.edit, "LOCK")).toEqual({ ok: false, code: "INVALID_STATE" });
    expect(await lock(w, w.edit, "CLOSE")).toMatchObject({ ok: true });
    expect(await lock(w, w.edit, "CLOSE")).toEqual({ ok: false, code: "INVALID_STATE" });
    expect(await lock(w, w.edit, "LOCK")).toEqual({ ok: false, code: "INVALID_STATE" });
    await submit(w, w.print);
    expect((await statusRow(w.edit)).status).toBe("LOCKED");
  });

  it("BR-SEL-006 lets exactly one of a client's submit and the Owner's close win", async () => {
    const w = await world();
    await pick(w, w.edit, "IMG_001.jpg");
    const [sent, closed] = await Promise.all([submit(w, w.edit), lock(w, w.edit, "CLOSE")]);
    expect([sent.ok, closed.ok].filter(Boolean)).toHaveLength(1);
    const status = (await statusRow(w.edit)).status;
    expect(status).toBe(closed.ok ? "LOCKED" : "SUBMITTED");
  });

  it("AC-ACC-006 refuses malformed input without touching the group", async () => {
    const w = await world();
    const result = await lockSelectionGroup(
      { selections: selectionDeps(db).selections, now: new Date() },
      fixture.context,
      fixture.ownerId,
      w.client.projectId,
      { groupId: w.edit, intent: "DELETE" },
    );
    expect(result).toEqual({ ok: false, code: "INVALID" });
    expect((await statusRow(w.edit)).status).toBe("OPEN");
  });
});

describe("tenant isolation (C-101)", () => {
  it("another workspace can't read, list or lock this workspace's groups", async () => {
    const w = await world();
    const [foreign] = await db
      .select({ workspaceId: project.workspaceId })
      .from(project)
      .where(eq(project.clientAccessToken, fixture.t3));
    const other = asWorkspaceId(foreign.workspaceId);
    const projectId = w.client.projectId;
    await expect(
      getSelectionCard(owner(), { workspaceId: other }, projectId),
    ).rejects.toBeInstanceOf(GalleryError);
    await expect(
      listSelectionGroups(owner(), { workspaceId: other }, projectId),
    ).rejects.toBeInstanceOf(GalleryError);
    await expect(
      getSelectionGroupDetail(owner(), { workspaceId: other }, projectId, w.edit),
    ).rejects.toBeInstanceOf(GalleryError);
    await expect(
      lockSelectionGroup(
        { selections: selectionDeps(db).selections, now: new Date() },
        { workspaceId: other },
        fixture.ownerId,
        projectId,
        { groupId: w.edit, intent: "CLOSE" },
      ),
    ).rejects.toBeInstanceOf(GalleryError);
    expect((await statusRow(w.edit)).status).toBe("OPEN");
  });

  it("AC-ACC-006 answers NOT_FOUND for a group of another project or a malformed id", async () => {
    const w = await world();
    const other = await world();
    await expect(
      getSelectionGroupDetail(owner(), fixture.context, w.client.projectId, other.edit),
    ).rejects.toBeInstanceOf(GalleryError);
    await expect(
      getSelectionGroupDetail(owner(), fixture.context, w.client.projectId, "nope"),
    ).rejects.toBeInstanceOf(GalleryError);
  });
});
