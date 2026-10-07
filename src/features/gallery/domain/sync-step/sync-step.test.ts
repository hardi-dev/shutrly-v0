import { describe, expect, it } from "vitest";

import type { FolderMapping } from "../photo-classification/photo-classification.types";
import { DRIVE_FOLDER_MIME, DRIVE_SHORTCUT_MIME } from "../sync-plan/sync-plan";
import type { FolderEntry, FolderListing, SyncedPhoto } from "../sync-plan/sync-plan.types";
import { startCursor, syncProgress, walkStep } from "./sync-step";
import type { StepWalk, SyncBudget, SyncCursor } from "./sync-step.types";

const ROOT = { folderId: "root-folder-id", resourceKey: null };
const BUDGET: SyncBudget = { maxListCalls: 40, maxEntries: 3000, maxPhotos: 20_000 };

function folder(id: string, name: string): FolderEntry {
  return { id, name, mimeType: DRIVE_FOLDER_MIME, resourceKey: null };
}
function file(name: string, mimeType = "image/jpeg"): FolderEntry {
  return { id: `id-${name}`, name, mimeType, resourceKey: null };
}

function lister(tree: Record<string, FolderEntry[]>, pageSize = 1000) {
  const state = { calls: 0 };
  const list = (ref: { folderId: string }, pageToken: string | null): Promise<FolderListing> => {
    state.calls += 1;
    const entries = tree[ref.folderId] ?? [];
    const start = pageToken === null ? 0 : Number(pageToken);
    const next = start + pageSize < entries.length ? String(start + pageSize) : null;
    return Promise.resolve({
      ok: true,
      entries: entries.slice(start, start + pageSize),
      nextPageToken: next,
    });
  };
  return { list, state };
}

interface Run {
  readonly steps: number;
  readonly photos: readonly SyncedPhoto[];
  readonly cursor: SyncCursor;
  readonly callsPerStep: readonly number[];
}

async function runToEnd(
  tree: Record<string, FolderEntry[]>,
  budget: SyncBudget = BUDGET,
  pageSize = 1000,
  mappings: readonly FolderMapping[] = [],
): Promise<Run> {
  const { list, state } = lister(tree, pageSize);
  let cursor = startCursor(ROOT, "Rina-Wisuda");
  const photos: SyncedPhoto[] = [];
  const callsPerStep: number[] = [];
  for (let steps = 1; steps < 1000; steps += 1) {
    const before = state.calls;
    const step = await walkStep(list, cursor, budget, mappings);
    if (!step.ok) throw new Error(`step failed: ${step.code}`);
    callsPerStep.push(state.calls - before);
    photos.push(...step.photos);
    cursor = step.cursor;
    if (step.done) return { steps, photos, cursor, callsPerStep };
  }
  throw new Error("never finished");
}

// A root with 94 subfolders of one photo each: 1 + 94 = 95 list calls.
function wideTree(): Record<string, FolderEntry[]> {
  const tree: Record<string, FolderEntry[]> = { "root-folder-id": [] };
  for (let n = 1; n <= 94; n += 1) {
    tree["root-folder-id"].push(folder(`f${String(n)}`, `Sesi-${String(n).padStart(2, "0")}`));
    tree[`f${String(n)}`] = [file(`S${String(n)}.jpg`)];
  }
  return tree;
}

describe("walkStep", () => {
  it("AC-GAL-032 a 95-call tree takes three steps of at most 40 list calls", async () => {
    const run = await runToEnd(wideTree());
    expect(run.steps).toBe(3);
    expect(run.callsPerStep).toEqual([40, 40, 15]);
    expect(run.photos).toHaveLength(94);
  });

  it("AC-GAL-032 the steps find the same photos as one big step", async () => {
    const stepped = await runToEnd(wideTree());
    const single = await runToEnd(wideTree(), { ...BUDGET, maxListCalls: 1000 });
    expect(single.steps).toBe(1);
    expect(stepped.photos).toEqual(single.photos);
    expect(stepped.cursor.seen).toEqual(single.cursor.seen);
  });

  it("AC-GAL-032 a step stops once it has read the entry cap, even below the call cap", async () => {
    const tree: Record<string, FolderEntry[]> = { "root-folder-id": [] };
    for (let n = 1; n <= 6; n += 1) {
      tree["root-folder-id"].push(folder(`f${String(n)}`, `F${String(n)}`));
      tree[`f${String(n)}`] = Array.from({ length: 1000 }, (_, i) =>
        file(`P${String(n)}_${String(i)}.jpg`),
      );
    }
    const run = await runToEnd(tree, { ...BUDGET, maxEntries: 2000 });
    expect(run.steps).toBe(3);
    expect(run.photos).toHaveLength(6000);
  });

  it("AC-GAL-032 a folder's next page resumes from its page token", async () => {
    const tree = { "root-folder-id": [file("A.jpg"), file("B.jpg"), file("C.jpg")] };
    const run = await runToEnd(tree, { ...BUDGET, maxListCalls: 1 }, 2);
    expect(run.steps).toBe(2);
    expect(run.photos.map((photo) => photo.fileName)).toEqual(["A.jpg", "B.jpg", "C.jpg"]);
  });

  it("AC-GAL-032 the counters add up across steps", async () => {
    const tree = {
      "root-folder-id": [file("notes.pdf", "application/pdf"), folder("a", "A")],
      a: [file("x.mp4", "video/mp4"), folder("b", "B")],
      b: [folder("c", "C")],
      c: [folder("d", "D")],
      d: [folder("e", "E")],
      e: [folder("f", "F")],
      f: [file("deep.jpg")],
    };
    const run = await runToEnd(tree, { ...BUDGET, maxListCalls: 2 });
    expect(run.cursor).toMatchObject({ ignoredCount: 2, tooDeepCount: 1, foldersDone: 6 });
    expect(run.photos).toHaveLength(0);
  });

  it("F-20 lists every subfolder within depth, empty ones too, across steps", async () => {
    const tree = {
      "root-folder-id": [folder("e", "Edit"), folder("p", "Proof"), file("A.jpg")],
      p: [folder("q", "Day 1"), file("B.jpg")],
    };
    const run = await runToEnd(tree, { ...BUDGET, maxListCalls: 1 });
    expect(run.cursor.folders).toEqual(["Edit", "Proof", "Proof/Day 1"]);
  });

  it("F-20 AC-GAL-030 classifies by the mapped subfolder, folding it out of the browse path, and skips shortcuts", async () => {
    const tree = {
      "root-folder-id": [
        file("IMG_001.jpg"),
        { id: "s", name: "link", mimeType: DRIVE_SHORTCUT_MIME, resourceKey: null },
        folder("ak", "Akad"),
      ],
      ak: [file("A_001.jpg"), folder("ed", "edited")],
      ed: [file("AE_001.jpg")],
    };
    const mapped = [{ path: "Akad/edited", kind: "EDITED" as const, projectItemId: "item-edit" }];
    const run = await runToEnd(tree, { ...BUDGET, maxListCalls: 1 }, 1000, mapped);
    expect(run.photos.map((p) => [p.fileName, p.kind, p.browsePath])).toEqual([
      ["IMG_001.jpg", "PROOF", ""],
      ["A_001.jpg", "PROOF", "Akad"],
      ["AE_001.jpg", "EDITED", "Akad"],
    ]);
  });

  it("F-20 AC-GAL-005 classifies the fixture by its mappings: 4 proof, 3 edited, 1 print, 2 ignored", async () => {
    const tree = {
      "root-folder-id": [
        file("IMG_001.jpg"),
        file("IMG_002.jpg"),
        file("IMG_010.jpg"),
        file("notes.pdf", "application/pdf"),
        file("clip.mp4", "video/mp4"),
        folder("edited-id", "Edited"),
        folder("print-id", "print"),
        folder("raw-id", "raw"),
      ],
      "edited-id": [file("E_001.jpg"), file("E_002.jpg"), folder("old-id", "old")],
      "print-id": [file("P_001.jpg")],
      "raw-id": [file("R_001.jpg")],
      "old-id": [file("X_001.jpg")],
    };
    const run = await runToEnd(tree, BUDGET, 1000, [
      { path: "Edited", kind: "EDITED", projectItemId: "item-edit" },
      { path: "print", kind: "PRINT", projectItemId: "item-print" },
    ]);
    const byKind = (kind: string) =>
      run.photos
        .filter((photo) => photo.kind === kind)
        .map((photo) => `${photo.folderPath}/${photo.fileName}`);
    expect(byKind("PROOF")).toEqual([
      "/IMG_001.jpg",
      "/IMG_002.jpg",
      "/IMG_010.jpg",
      "raw/R_001.jpg",
    ]);
    expect(byKind("EDITED")).toEqual([
      "Edited/E_001.jpg",
      "Edited/E_002.jpg",
      "Edited/old/X_001.jpg",
    ]);
    expect(byKind("PRINT")).toEqual(["print/P_001.jpg"]);
    expect(run.cursor.ignoredCount).toBe(2);
  });

  it("AC-GAL-030 skips a folder 6 levels below the source and counts it", async () => {
    const tree = {
      "root-folder-id": [folder("d1", "1")],
      d1: [folder("d2", "2")],
      d2: [folder("d3", "3")],
      d3: [folder("d4", "4")],
      d4: [folder("d5", "5")],
      d5: [folder("d6", "6"), file("deep5.jpg")],
      d6: [file("deep6.jpg")],
    };
    const run = await runToEnd(tree);
    expect(run.photos.map((photo) => photo.fileName)).toEqual(["deep5.jpg"]);
    expect(run.cursor.tooDeepCount).toBe(1);
  });

  it("BR-GAL-006 a provider failure ends the run with its code", async () => {
    const failing = (): Promise<FolderListing> =>
      Promise.resolve({ ok: false, code: "NOT_PUBLIC" });
    const step: StepWalk = await walkStep(failing, startCursor(ROOT, "x"), BUDGET);
    expect(step).toEqual({ ok: false, code: "NOT_PUBLIC" });
  });

  it("BR-GAL-006 a run over the photo cap fails with TOO_LARGE", async () => {
    const tree = { "root-folder-id": [file("A.jpg"), file("B.jpg"), file("C.jpg")] };
    const { list } = lister(tree);
    const step = await walkStep(list, startCursor(ROOT, "x"), { ...BUDGET, maxPhotos: 2 });
    expect(step).toEqual({ ok: false, code: "TOO_LARGE" });
  });

  it("AC-GAL-032 reports the progress as folders done of folders known", async () => {
    const { list } = lister(wideTree());
    const step = await walkStep(list, startCursor(ROOT, "x"), BUDGET);
    if (!step.ok) throw new Error("step failed");
    expect(step.done).toBe(false);
    expect(syncProgress(step.cursor)).toEqual({ foldersDone: 40, foldersTotal: 95 });
  });
});
