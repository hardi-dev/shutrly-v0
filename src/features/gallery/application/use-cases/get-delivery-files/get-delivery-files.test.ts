import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type { GalleryPhotoRecord } from "../../ports/gallery-repository/gallery-repository.port";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import { getDeliveryFiles } from "./get-delivery-files";

const CLIENT: ClientContext = {
  workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa"),
  projectId: "p",
  galleryId: "g",
  sessionId: "s",
  token: "tok",
  contentVersion: 1,
  finalDeliveryPublished: true,
};

const photo = (id: string, kind: GalleryPhotoRecord["kind"]): GalleryPhotoRecord => ({
  id,
  fileName: `${id}.jpg`,
  kind,
  folderPath: "edited",
  browsePath: "edited",
  sourceId: "s1",
  sourceName: "Rina",
  externalFileId: `drive-${id}`,
  provider: "GOOGLE_DRIVE",
  resourceKey: null,
  missing: false,
});

function deps() {
  const listFinishedPhotos = vi.fn(() =>
    Promise.resolve([photo("E_001", "EDITED"), photo("P_001", "PRINT")]),
  );
  return {
    value: { reader: { listFinishedPhotos }, directImages: true } as never,
    listFinishedPhotos,
  };
}

describe("getDeliveryFiles (klien-8)", () => {
  it("AC-DEL-003 splits the files by kind with their download URL", async () => {
    const { value } = deps();
    const files = await getDeliveryFiles(value, CLIENT);
    expect(files?.edited.map((file) => [file.fileName, file.downloadUrl])).toEqual([
      ["E_001.jpg", "/g/tok/download/E_001"],
    ]);
    expect(files?.print.map((file) => file.fileName)).toEqual(["P_001.jpg"]);
  });

  it("BR-DEL-002 nothing before final delivery, without reading", async () => {
    const { value, listFinishedPhotos } = deps();
    expect(await getDeliveryFiles(value, { ...CLIENT, finalDeliveryPublished: false })).toBeNull();
    expect(listFinishedPhotos).not.toHaveBeenCalled();
  });
});
