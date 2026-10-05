import { describe, expect, it } from "vitest";

import { startCursor } from "@/features/gallery/domain/sync-step/sync-step";

import { parseSyncCursor } from "./sync-cursor";

const ROOT = { folderId: "1AbCdEfGhIjKlMnOp", resourceKey: null };

describe("parseSyncCursor", () => {
  it("AC-GAL-032 reads back a cursor that went through JSON", () => {
    const cursor = startCursor(ROOT, "Rina-Wisuda");
    expect(parseSyncCursor(JSON.parse(JSON.stringify(cursor)))).toEqual(cursor);
  });

  it("AC-GAL-032 refuses a value that is not a cursor", () => {
    expect(parseSyncCursor(null)).toBeNull();
    expect(parseSyncCursor({ queue: "x" })).toBeNull();
    expect(parseSyncCursor({ ...startCursor(ROOT, "x"), foldersDone: -1 })).toBeNull();
  });

  it("AC-GAL-032 refuses a queue entry deeper than the walk allows", () => {
    const cursor = startCursor(ROOT, "x");
    const deep = { ...cursor.queue[0], segments: ["a", "b", "c", "d", "e", "f"] };
    expect(parseSyncCursor({ ...cursor, queue: [deep] })).toBeNull();
  });
});
