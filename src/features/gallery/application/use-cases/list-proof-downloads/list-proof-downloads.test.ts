import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import { listProofDownloads } from "./list-proof-downloads";
import type { ListProofDownloadsDeps } from "./list-proof-downloads.types";

const CLIENT: ClientContext = {
  workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa"),
  projectId: "p",
  galleryId: "g",
  sessionId: "s",
  token: "tok",
  finalDeliveryPublished: false,
  contentVersion: 1,
};

describe("listProofDownloads (F-19)", () => {
  it("F-19 lists every proof of the gallery with its download URL", async () => {
    const listProofFiles = vi.fn(() =>
      Promise.resolve([
        { id: "a", fileName: "IMG_001.jpg" },
        { id: "b", fileName: "IMG_002.jpg" },
      ]),
    );
    const deps = { reader: { listProofFiles } } as unknown as ListProofDownloadsDeps;
    expect(await listProofDownloads(deps, CLIENT)).toEqual([
      { id: "a", fileName: "IMG_001.jpg", downloadUrl: "/g/tok/download/a" },
      { id: "b", fileName: "IMG_002.jpg", downloadUrl: "/g/tok/download/b" },
    ]);
    expect(listProofFiles).toHaveBeenCalledWith({ workspaceId: CLIENT.workspaceId }, "g");
  });
});
