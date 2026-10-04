import { RINA_FOLDER_ID, SECOND_FOLDER_ID } from "@tests/support/gallery/fake-drive-provider";
import { OTHER_WORKSPACE, OWNER_ID, WORKSPACE } from "@tests/support/gallery/gallery-fixtures";
import { BOTH_FOLDERS, lifecycleSetup } from "@tests/support/gallery/lifecycle-fixtures";
import { GALLERY_ID } from "@tests/support/gallery/source-fixtures";
import { describe, expect, it } from "vitest";

import { publishGallery } from "./publish-gallery";

describe("publishGallery", () => {
  it("AC-GAL-016 publishes a draft with an accessible folder", async () => {
    const { deps, sources } = await lifecycleSetup();
    expect(await publishGallery(deps, WORKSPACE, OWNER_ID, GALLERY_ID)).toEqual({ ok: true });
    expect(sources.galleries.get(GALLERY_ID)?.status).toBe("PUBLISHED");
  });

  it("AC-GAL-018 turns 30 days into publish time + 30 days", async () => {
    const { deps, sources } = await lifecycleSetup({ expiryDays: 30 });
    await publishGallery(deps, WORKSPACE, OWNER_ID, GALLERY_ID);
    expect(sources.galleries.get(GALLERY_ID)).toMatchObject({
      expiresAt: new Date("2026-11-03T03:00:00Z"),
      expiryDays: null,
    });
  });

  it("AC-GAL-017 refuses without folders, or when the only folder stopped being public", async () => {
    const empty = await lifecycleSetup({}, []);
    expect(await publishGallery(empty.deps, WORKSPACE, OWNER_ID, GALLERY_ID)).toEqual({
      ok: false,
      code: "PUBLISH_REFUSED",
      failures: [],
    });
    const { deps, provider, sources } = await lifecycleSetup();
    provider.failures.set(RINA_FOLDER_ID, "NOT_PUBLIC");
    expect(await publishGallery(deps, WORKSPACE, OWNER_ID, GALLERY_ID)).toEqual({
      ok: false,
      code: "PUBLISH_REFUSED",
      failures: [{ name: "Rina-Wisuda", code: "NOT_PUBLIC" }],
    });
    expect(sources.galleries.get(GALLERY_ID)?.status).toBe("DRAFT");
  });

  it("AC-GAL-017 publishes when one of two folders fails", async () => {
    const { deps, provider } = await lifecycleSetup({}, BOTH_FOLDERS);
    provider.failures.set(SECOND_FOLDER_ID, "NOT_PUBLIC");
    expect(await publishGallery(deps, WORKSPACE, OWNER_ID, GALLERY_ID)).toEqual({ ok: true });
  });

  it("AC-GAL-022 AC-GAL-024 refuses a published gallery or a cancelled project", async () => {
    for (const state of [
      { status: "PUBLISHED" as const },
      { projectStatus: "CANCELLED" as const },
    ]) {
      const { deps } = await lifecycleSetup(state);
      expect(await publishGallery(deps, WORKSPACE, OWNER_ID, GALLERY_ID)).toEqual({
        ok: false,
        code: "INVALID_STATE",
      });
    }
  });

  it("AC-GAL-025 treats another workspace as not found", async () => {
    const { deps } = await lifecycleSetup();
    await expect(publishGallery(deps, OTHER_WORKSPACE, OWNER_ID, GALLERY_ID)).rejects.toMatchObject(
      { code: "NOT_FOUND" },
    );
  });
});
