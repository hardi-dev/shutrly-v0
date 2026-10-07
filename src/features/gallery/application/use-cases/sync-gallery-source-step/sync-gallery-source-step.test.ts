import {
  folderEntry,
  imageEntry,
  RINA_FOLDER_ID,
} from "@tests/support/gallery/fake-drive-provider";
import { OTHER_WORKSPACE, OWNER_ID, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { DRIVE_SOURCE_ID, GALLERY_ID, sourceSetup } from "@tests/support/gallery/source-fixtures";
import { describe, expect, it } from "vitest";

import { linkGallerySource } from "../link-gallery-source/link-gallery-source";
import { syncGallerySourceStep } from "./sync-gallery-source-step";
import type { SyncGalleryDeps, SyncStepOutcome } from "./sync-gallery-source-step.types";

const VALUES = {
  workspaceSourceId: DRIVE_SOURCE_ID,
  link: `https://drive.google.com/drive/folders/${RINA_FOLDER_ID}`,
  label: "",
};

async function linked() {
  const setup = sourceSetup();
  await linkGallerySource(setup.deps, WORKSPACE, OWNER_ID, GALLERY_ID, VALUES);
  return setup;
}

interface Run {
  readonly outcomes: readonly SyncStepOutcome[];
  readonly last: SyncStepOutcome;
}

async function syncToEnd(deps: SyncGalleryDeps): Promise<Run> {
  const outcomes: SyncStepOutcome[] = [];
  for (let step = 0; step < 50; step += 1) {
    const outcome = await syncGallerySourceStep(deps, WORKSPACE, "source-1");
    outcomes.push(outcome);
    if (!outcome.ok || outcome.status !== "CONTINUE") break;
  }
  return { outcomes, last: outcomes[outcomes.length - 1] };
}

// A root with 94 subfolders of one photo each: 95 list calls, so three steps.
function wideTree(setup: Awaited<ReturnType<typeof linked>>) {
  const root = [];
  for (let n = 1; n <= 94; n += 1) {
    root.push(folderEntry(`f${String(n)}`, `Sesi-${String(n)}`));
    setup.provider.tree.set(`f${String(n)}`, [imageEntry(`S${String(n)}.jpg`)]);
  }
  setup.provider.tree.set(RINA_FOLDER_ID, root);
}

describe("syncGallerySourceStep", () => {
  it("AC-GAL-005 syncs the linked folder: 4 proof, 3 edited, 1 print", async () => {
    const { deps, sources } = await linked();
    expect((await syncToEnd(deps)).last).toEqual({
      ok: true,
      status: "SUCCEEDED",
      newFolders: ["Edited", "Edited/old", "print", "raw"],
    });
    const kinds = sources.photos.map((photo) => photo.kind);
    expect(kinds.filter((kind) => kind === "PROOF")).toHaveLength(4);
    expect(kinds.filter((kind) => kind === "EDITED")).toHaveLength(3);
    expect(kinds.filter((kind) => kind === "PRINT")).toHaveLength(1);
    expect(sources.sources[0]).toMatchObject({ folderName: "Rina-Wisuda", label: null });
  });

  it("F-20 a re-sync names no folder twice, and without a mapping every photo is a proof", async () => {
    const { deps, sources } = await linked();
    sources.defaultMappings = [];
    await syncToEnd(deps);
    expect((await syncToEnd(deps)).last).toEqual({ ok: true, status: "SUCCEEDED", newFolders: [] });
    expect(new Set(sources.photos.map((photo) => photo.kind))).toEqual(new Set(["PROOF"]));
  });

  it("AC-GAL-008 an unshared folder ends as Gagal with no photos", async () => {
    const { deps, sources, provider } = await linked();
    provider.failures.set(RINA_FOLDER_ID, "NOT_PUBLIC");
    expect((await syncToEnd(deps)).last).toEqual({
      ok: true,
      status: "FAILED",
      errorCode: "NOT_PUBLIC",
    });
    expect(sources.photos).toHaveLength(0);
  });

  it("AC-GAL-006 re-syncing never duplicates", async () => {
    const { deps, sources } = await linked();
    await syncToEnd(deps);
    await syncToEnd(deps);
    await syncToEnd(deps);
    expect(sources.photos).toHaveLength(8);
  });

  it("AC-GAL-007 marks a removed file missing and clears it when it returns", async () => {
    const { deps, sources, provider } = await linked();
    await syncToEnd(deps);
    const root = provider.tree.get(RINA_FOLDER_ID) ?? [];
    provider.tree.set(RINA_FOLDER_ID, [
      ...root.filter((entry) => entry.name !== "IMG_002.jpg"),
      imageEntry("IMG_011.jpg"),
    ]);
    await syncToEnd(deps);
    expect(sources.photos.find((photo) => photo.fileName === "IMG_002.jpg")?.missing).toBe(true);
    expect(sources.photos.find((photo) => photo.fileName === "IMG_011.jpg")?.kind).toBe("PROOF");
    provider.tree.set(RINA_FOLDER_ID, root);
    await syncToEnd(deps);
    expect(sources.photos.find((photo) => photo.fileName === "IMG_002.jpg")?.missing).toBe(false);
  });

  it("AC-GAL-032 a 95-call tree takes three steps of at most 40 list calls each", async () => {
    const setup = await linked();
    wideTree(setup);
    const calls: number[] = [];
    const outcomes: SyncStepOutcome[] = [];
    for (let step = 0; step < 10; step += 1) {
      const before = setup.provider.listCalls;
      outcomes.push(await syncGallerySourceStep(setup.deps, WORKSPACE, "source-1"));
      calls.push(setup.provider.listCalls - before);
      const latest = outcomes[step];
      if (latest.ok && latest.status === "SUCCEEDED") break;
    }
    expect(calls).toEqual([40, 40, 15]);
    expect(outcomes[0]).toEqual({
      ok: true,
      status: "CONTINUE",
      foldersDone: 40,
      foldersTotal: 95,
    });
    expect(outcomes[2]).toMatchObject({ ok: true, status: "SUCCEEDED" });
    expect(setup.sources.photos).toHaveLength(94);
  });

  it("AC-GAL-032 a second step is refused while one holds the run, and continues once it ends", async () => {
    const setup = await linked();
    wideTree(setup);
    const held = setup.sources.sources[0];
    Object.assign(held, { syncStatus: "SYNCING", leaseAt: setup.deps.now });
    expect(await syncGallerySourceStep(setup.deps, WORKSPACE, "source-1")).toEqual({
      ok: false,
      code: "SYNC_IN_PROGRESS",
    });
    held.leaseAt = null;
    expect(await syncGallerySourceStep(setup.deps, WORKSPACE, "source-1")).toMatchObject({
      ok: true,
      status: "CONTINUE",
    });
  });

  it("AC-GAL-032 a run that fails in step 2 keeps what step 1 saved and marks nothing missing", async () => {
    const setup = await linked();
    wideTree(setup);
    await syncToEnd(setup.deps);
    const before = setup.sources.photos.length;
    setup.provider.tree.set(RINA_FOLDER_ID, [
      ...(setup.provider.tree.get(RINA_FOLDER_ID) ?? []).slice(0, 60),
    ]);
    setup.provider.failures.set("f50", "UNAVAILABLE");
    const run = await syncToEnd(setup.deps);
    expect(run.last).toEqual({ ok: true, status: "FAILED", errorCode: "UNAVAILABLE" });
    expect(setup.sources.photos).toHaveLength(before);
    expect(setup.sources.photos.some((photo) => photo.missing)).toBe(false);
    expect(setup.sources.sources[0]).toMatchObject({ syncStatus: "FAILED", cursor: null });
  });

  it("AC-GAL-033 an unchanged re-sync writes no photo row, and a rename writes one", async () => {
    const { deps, sources, provider } = await linked();
    await syncToEnd(deps);
    const written = sources.photoWrites;
    await syncToEnd(deps);
    expect(sources.photoWrites).toBe(written);
    const root = provider.tree.get(RINA_FOLDER_ID) ?? [];
    provider.tree.set(
      RINA_FOLDER_ID,
      root.map((entry) =>
        entry.name === "IMG_001.jpg" ? { ...entry, name: "IMG_001-baru.jpg" } : entry,
      ),
    );
    await syncToEnd(deps);
    expect(sources.photoWrites).toBe(written + 1);
  });

  it("D-19 counts only the start of a run against the workspace rate limit", async () => {
    const setup = await linked();
    wideTree(setup);
    await syncGallerySourceStep(setup.deps, WORKSPACE, "source-1");
    await syncGallerySourceStep(setup.deps, WORKSPACE, "source-1");
    expect(setup.rateLimiter.hit).toHaveBeenCalledTimes(1);
    expect(setup.rateLimiter.hit).toHaveBeenLastCalledWith(
      `gallery-sync:${WORKSPACE.workspaceId}`,
      { limit: 20, windowSeconds: 60 },
    );
  });

  it("D-19 refuses a run start past the workspace sync rate limit", async () => {
    const { deps, rateLimiter } = await linked();
    rateLimiter.hit.mockResolvedValueOnce(false);
    expect(await syncGallerySourceStep(deps, WORKSPACE, "source-1")).toEqual({
      ok: false,
      code: "RATE_LIMITED",
    });
  });

  it("AC-GAL-008 a provider failure keeps the earlier photos", async () => {
    const { deps, sources, provider } = await linked();
    await syncToEnd(deps);
    provider.failures.set(RINA_FOLDER_ID, "UNAVAILABLE");
    expect(await syncGallerySourceStep(deps, WORKSPACE, "source-1")).toEqual({
      ok: true,
      status: "FAILED",
      errorCode: "UNAVAILABLE",
    });
    expect(sources.photos).toHaveLength(8);
    expect(sources.sources[0]).toMatchObject({
      syncStatus: "FAILED",
      syncErrorCode: "UNAVAILABLE",
    });
  });

  it("AC-GAL-013 refuses a removed source and AC-GAL-025 another workspace", async () => {
    const { deps, sources } = await linked();
    sources.sources[0].removed = true;
    expect(await syncGallerySourceStep(deps, WORKSPACE, "source-1")).toEqual({
      ok: false,
      code: "INVALID_STATE",
    });
    await expect(syncGallerySourceStep(deps, OTHER_WORKSPACE, "source-1")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
