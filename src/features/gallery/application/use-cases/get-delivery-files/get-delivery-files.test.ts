import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type { FinishedPhotoRecord } from "../../ports/client-gallery-reader/client-gallery-reader.port";
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

const photo = (
  id: string,
  kind: GalleryPhotoRecord["kind"],
  item: { itemId: string; itemName: string } | null = null,
): FinishedPhotoRecord => ({
  itemId: item?.itemId ?? null,
  itemName: item?.itemName ?? null,
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
    Promise.resolve([
      photo("E_001", "EDITED", { itemId: "i-edit", itemName: "Foto edit" }),
      photo("E_002", "EDITED", { itemId: "i-edit", itemName: "Foto edit" }),
      photo("P_001", "PRINT"),
    ]),
  );
  const listDeliveryItems = vi.fn(() =>
    Promise.resolve([
      { id: "i-edit", name: "Foto edit" },
      { id: "i-print", name: "Foto cetak" },
    ]),
  );
  return {
    value: { reader: { listFinishedPhotos, listDeliveryItems }, directImages: true } as never,
    listFinishedPhotos,
  };
}

describe("getDeliveryFiles (klien-8)", () => {
  it("AC-DEL-003 F-21 groups the files per package item, empty items included, with their download URL", async () => {
    const { value } = deps();
    const files = await getDeliveryFiles(value, CLIENT);
    expect(files?.groups.map((group) => [group.id, group.name, group.files.length])).toEqual([
      ["i-edit", "Foto edit", 2],
      ["i-print", "Foto cetak", 0],
      ["PRINT", "Print", 1],
    ]);
    expect(files?.groups[0]?.files[0]?.downloadUrl).toBe("/g/tok/download/E_001");
  });

  it("BR-DEL-002 nothing before final delivery, without reading", async () => {
    const { value, listFinishedPhotos } = deps();
    expect(await getDeliveryFiles(value, { ...CLIENT, finalDeliveryPublished: false })).toBeNull();
    expect(listFinishedPhotos).not.toHaveBeenCalled();
  });
});
