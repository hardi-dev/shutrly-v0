import "server-only";

import type { GallerySourceProviderPort } from "@/features/gallery/application/ports/gallery-source-provider/gallery-source-provider.port";

import { fixtureFolder } from "./fixture-drive-tree";

function placeholder(fileId: string): ReadableStream<Uint8Array> {
  const label = fileId.replace(/^fixture-/, "").replace(/[^\w.-]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="lightgray"/><text x="200" y="155" font-size="24" text-anchor="middle" fill="dimgray">${label}</text></svg>`;
  return new Response(svg).body ?? new ReadableStream();
}

/** Creates the fixture Drive provider used when `E2E_FAKE_DRIVE=1`: the AC folder tree, an unshared folder, and placeholder images (TD › Testing Strategy). @returns the provider port */
export function createFixtureDriveProvider(): GallerySourceProviderPort {
  return {
    getFolder: (folder) => {
      const found = fixtureFolder(folder.folderId);
      return Promise.resolve(
        found ? { ok: true, name: found.name } : { ok: false, code: "NOT_PUBLIC" },
      );
    },
    listFolder: (folder) => {
      const found = fixtureFolder(folder.folderId);
      return Promise.resolve(
        found
          ? { ok: true, entries: found.entries, nextPageToken: null }
          : { ok: false, code: "NOT_PUBLIC" },
      );
    },
    thumbnail: (file) =>
      Promise.resolve(
        file.fileId.startsWith("fixture-")
          ? { ok: true, body: placeholder(file.fileId), contentType: "image/svg+xml" }
          : { ok: false },
      ),
    // Fixture originals are the placeholders; an id with "missing" fails, like a file gone from Drive.
    download: (file) =>
      Promise.resolve(
        file.fileId.startsWith("fixture-") && !file.fileId.includes("missing")
          ? {
              ok: true,
              body: placeholder(file.fileId),
              contentType: "image/svg+xml",
              contentLength: null,
            }
          : { ok: false },
      ),
  };
}
