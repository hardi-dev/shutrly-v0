import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type { GalleryBrowseReaderPort } from "../../ports/gallery-browse-reader/gallery-browse-reader.port";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import { browsePickPhotos } from "./browse-pick-photos";

const CLIENT: ClientContext = {
  workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa"),
  projectId: "00000000-0000-4000-8000-000000000001",
  galleryId: "00000000-0000-4000-8000-000000000002",
  sessionId: "0123456789abcdef0123456789abcdef",
  token: "A".repeat(43),
  contentVersion: 1,
  finalDeliveryPublished: false,
};
const PHOTO = {
  id: "00000000-0000-4000-8000-000000000030",
  fileName: "IMG_001.jpg",
  kind: "PROOF" as const,
  folderPath: "Sesi 1",
  browsePath: "Sesi 1",
  sourceId: "s1",
  sourceName: null,
  externalFileId: "drive-file-1",
  provider: "GOOGLE_DRIVE" as const,
  resourceKey: null,
  missing: false,
};

function reader() {
  const searchPhotos = vi.fn(() =>
    Promise.resolve({ photos: [PHOTO], nextCursor: null, total: 24 }),
  );
  return { browse: { searchPhotos } as unknown as GalleryBrowseReaderPort, searchPhotos };
}

describe("browsePickPhotos (pilih exports)", () => {
  it("AC-SEL-002 reads the flat proof grid of the client's gallery, 48 at a time", async () => {
    const { browse, searchPhotos } = reader();
    const page = await browsePickPhotos({ browse, directImages: false }, CLIENT, null);
    expect(searchPhotos).toHaveBeenCalledWith(
      { workspaceId: CLIENT.workspaceId },
      CLIENT.galleryId,
      "",
      null,
      48,
    );
    expect(page.total).toBe(24);
    expect(page.photos[0]).toMatchObject({
      id: PHOTO.id,
      thumb: { src: `/g/${CLIENT.token}/media/${PHOTO.id}/thumb` },
    });
  });

  it("C-004 reads the first page for a malformed cursor", async () => {
    const { browse, searchPhotos } = reader();
    await browsePickPhotos({ browse, directImages: false }, CLIENT, { sortKey: 1 });
    expect(searchPhotos).toHaveBeenCalledWith(expect.anything(), CLIENT.galleryId, "", null, 48);
  });
});
