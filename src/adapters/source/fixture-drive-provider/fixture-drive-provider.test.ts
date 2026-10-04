import { describe, expect, it } from "vitest";

import { walkFolderTree } from "@/features/gallery/domain/sync-plan/sync-plan";

import { createFixtureDriveProvider } from "./fixture-drive-provider";
import { FIXTURE_NOT_PUBLIC_ID } from "./fixture-drive-tree";

describe("fixture drive provider", () => {
  it("AC-GAL-005 serves the AC fixture tree", async () => {
    const provider = createFixtureDriveProvider();
    const root = { folderId: "fixtureRinaWisuda01", resourceKey: null };
    expect(await provider.getFolder(root)).toEqual({ ok: true, name: "Rina-Wisuda" });
    const walk = await walkFolderTree(provider.listFolder, root);
    expect(walk.ok && walk.photos).toHaveLength(8);
  });

  it("AC-GAL-008 refuses the unshared folder", async () => {
    const provider = createFixtureDriveProvider();
    expect(
      await provider.getFolder({ folderId: FIXTURE_NOT_PUBLIC_ID, resourceKey: null }),
    ).toEqual({
      ok: false,
      code: "NOT_PUBLIC",
    });
  });
});
