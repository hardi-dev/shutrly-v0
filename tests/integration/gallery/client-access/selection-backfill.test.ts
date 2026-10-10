import { readFileSync } from "node:fs";

import { eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { gallery } from "@/adapters/db/schema/gallery/gallery";
import { selectionGroup } from "@/adapters/db/schema/gallery/selection";

import { openTestDb } from "../../helpers/test-db";
import { addProjectItems, seedClientAccess, seedProjectWithGallery } from "./fixture";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

const migration = readFileSync(
  new URL("../../../../drizzle/0016_selection.sql", import.meta.url),
  "utf8",
);
const backfill = migration
  .split("--> statement-breakpoint")
  .find((statement) => statement.includes('INSERT INTO "selection_group"'));

describe("0016 group backfill (A-23)", () => {
  it("AC-SEL-001 creates groups for a published gallery and none for a draft", async () => {
    const fixture = await seedClientAccess(db);
    const workspaceId = fixture.context.workspaceId;
    const draft = await seedProjectWithGallery(db, {
      workspaceId,
      serviceId: fixture.serviceId,
      clientName: "Dina",
      title: "Wisuda Dina",
      status: "BOOKED",
    });
    await db
      .update(gallery)
      .set({ status: "DRAFT", publishedAt: null })
      .where(eq(gallery.id, draft.galleryId));
    const items = [
      { name: "Foto edit", value: 3, pickMode: "COUNT" as const },
      { name: "Album", value: 1, pickMode: null },
    ];
    await addProjectItems(db, { workspaceId, projectId: fixture.projectId }, items);
    await addProjectItems(db, { workspaceId, projectId: draft.projectId }, items);

    await db.execute(sql.raw(backfill ?? "missing backfill"));

    const groupsOf = (projectId: string) =>
      db
        .select({ baseLimit: selectionGroup.baseLimit, status: selectionGroup.status })
        .from(selectionGroup)
        .where(eq(selectionGroup.projectId, projectId));
    expect(await groupsOf(fixture.projectId)).toEqual([{ baseLimit: 3, status: "OPEN" }]);
    expect(await groupsOf(draft.projectId)).toEqual([]);
  });
});
