import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type { ClientMediaPhotoRecord } from "../../ports/client-gallery-reader/client-gallery-reader.port";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import { serveClientFile } from "./serve-client-file";
import type { ServeClientFileDeps } from "./serve-client-file.types";

const CLIENT: ClientContext = {
  workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa"),
  projectId: "p",
  galleryId: "g",
  sessionId: "s",
  token: "t",
  finalDeliveryPublished: true,
  contentVersion: 1,
};
const EDITED: ClientMediaPhotoRecord = {
  externalFileId: "drive-e1",
  resourceKey: null,
  fileName: "E_001.jpg",
  kind: "EDITED",
  missing: false,
  sourceRemoved: false,
};

function deps(photo: ClientMediaPhotoRecord | null, downloads = true) {
  const download = vi.fn(() =>
    Promise.resolve(
      downloads
        ? {
            ok: true as const,
            body: new ReadableStream(),
            contentType: "image/jpeg",
            contentLength: "9",
          }
        : { ok: false as const },
    ),
  );
  const value = {
    reader: { findClientMediaPhoto: vi.fn(() => Promise.resolve(photo)) },
    provider: { download },
  } as unknown as ServeClientFileDeps;
  return { value, download };
}

describe("serveClientFile (D-18)", () => {
  it("AC-DEL-003 streams a delivered finished file with its name", async () => {
    const { value, download } = deps(EDITED);
    expect(await serveClientFile(value, CLIENT, "x")).toMatchObject({
      ok: true,
      fileName: "E_001.jpg",
      contentType: "image/jpeg",
    });
    expect(download).toHaveBeenCalledWith({ fileId: "drive-e1", resourceKey: null });
  });

  it.each([
    ["before delivery", EDITED, { finalDeliveryPublished: false }],
    ["a proof", { ...EDITED, kind: "PROOF" as const }, {}],
    ["a missing file", { ...EDITED, missing: true }, {}],
    ["a removed folder", { ...EDITED, sourceRemoved: true }, {}],
    ["another gallery's photo", null, {}],
  ])("AC-DEL-004 refuses %s without calling Drive", async (_label, photo, patch) => {
    const { value, download } = deps(photo);
    expect(await serveClientFile(value, { ...CLIENT, ...patch }, "x")).toEqual({ ok: false });
    expect(download).not.toHaveBeenCalled();
  });

  it("AC-DEL-005 a file Drive no longer has is not ok", async () => {
    const { value } = deps(EDITED, false);
    expect(await serveClientFile(value, CLIENT, "x")).toEqual({ ok: false });
  });
});
