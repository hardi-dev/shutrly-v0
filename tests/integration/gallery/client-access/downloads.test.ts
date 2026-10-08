import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { createWorkersClientListCache } from "@/adapters/cache/workers-client-list-cache/workers-client-list-cache";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleClientGalleryReader } from "@/adapters/db/gallery-repository/drizzle-client-gallery-reader";
import { createDrizzleGalleryBrowseReader } from "@/adapters/db/gallery-repository/drizzle-gallery-browse-reader";
import { galleryPhoto, gallerySource } from "@/adapters/db/schema/gallery/gallery";
import type { GallerySourceProviderPort } from "@/features/gallery/application/ports/gallery-source-provider/gallery-source-provider.port";
import { browseClientPhotos } from "@/features/gallery/application/use-cases/browse-client-photos/browse-client-photos";
import { listProofDownloads } from "@/features/gallery/application/use-cases/list-proof-downloads/list-proof-downloads";
import { serveClientFile } from "@/features/gallery/application/use-cases/serve-client-file/serve-client-file";

import { openTestDb } from "../../helpers/test-db";
import { clientContextOf } from "./client-context";
import {
  type ClientAccessFixture,
  seedClientAccess,
  seedPhotos,
  seedProjectWithGallery,
} from "./fixture";

let db: Db;
let close: () => Promise<void>;
let fixture: ClientAccessFixture;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
  fixture = await seedClientAccess(db);
});
afterAll(() => close());

/** A Drive that serves every file except the ones in `gone` (deleted on Drive, not yet synced). */
function drive(gone: ReadonlySet<string> = new Set()) {
  const download = vi.fn((file: { fileId: string }) =>
    Promise.resolve(
      gone.has(file.fileId)
        ? { ok: false as const }
        : {
            ok: true as const,
            body: new Response(`original:${file.fileId}`).body ?? new ReadableStream(),
            contentType: "image/jpeg",
            contentLength: null,
          },
    ),
  );
  return { provider: { download } as unknown as GallerySourceProviderPort, download };
}

async function seedDelivered(delivered: boolean) {
  const workspaceId = fixture.context.workspaceId;
  const rina = await seedProjectWithGallery(db, {
    workspaceId,
    serviceId: fixture.serviceId,
    clientName: "Rina",
    title: "Wisuda Rina",
    status: delivered ? "DELIVERED" : "POST_PROCESSING",
  });
  const target = { workspaceId, ...rina };
  const { photoIds, sourceId } = await seedPhotos(db, target, [
    { fileName: "IMG_001.jpg" },
    { fileName: "E_001.jpg", kind: "EDITED", folderPath: "edited" },
    { fileName: "E_002.jpg", kind: "EDITED", folderPath: "edited" },
    { fileName: "E_009.jpg", kind: "EDITED", folderPath: "edited", missing: true },
    { fileName: "P_001.jpg", kind: "PRINT", folderPath: "print" },
  ]);
  const client = clientContextOf({ ...target, finalDeliveryPublished: delivered });
  return { client, photoIds, sourceId };
}

const deps = (provider: GallerySourceProviderPort) => ({
  reader: createDrizzleClientGalleryReader(db),
  provider,
});

async function externalIdOf(photoId: string) {
  const [row] = await db
    .select({ id: galleryPhoto.externalFileId })
    .from(galleryPhoto)
    .where(eq(galleryPhoto.id, photoId));
  return row.id;
}

async function readText(stream: ReadableStream<Uint8Array>) {
  return new Response(stream).text();
}

describe("finished-file downloads (D-18)", () => {
  it("AC-DEL-003 serves the original of a delivered edited and print file, by its name", async () => {
    const { client, photoIds } = await seedDelivered(true);
    const { provider } = drive();
    for (const name of ["E_001.jpg", "P_001.jpg"]) {
      const result = await serveClientFile(deps(provider), client, photoIds[name]);
      if (!result.ok) throw new Error(`${name} not served`);
      expect(result.fileName).toBe(name);
      expect(await readText(result.body)).toBe(`original:${await externalIdOf(photoIds[name])}`);
    }
  });

  it("AC-DEL-004 serves no finished file before delivery, no missing file and no other project's file", async () => {
    const before = await seedDelivered(false);
    const after = await seedDelivered(true);
    const { provider, download } = drive();
    const refused = [
      [before.client, before.photoIds["E_001.jpg"]],
      [after.client, after.photoIds["E_009.jpg"]],
      [after.client, before.photoIds["E_001.jpg"]],
    ] as const;
    for (const [client, photoId] of refused) {
      expect(await serveClientFile(deps(provider), client, photoId)).toEqual({ ok: false });
    }
    expect(download).not.toHaveBeenCalled();
  });

  it("F-20 serves the original of a proof before and after delivery", async () => {
    for (const delivered of [false, true]) {
      const seeded = await seedDelivered(delivered);
      const { provider } = drive();
      const result = await serveClientFile(
        deps(provider),
        seeded.client,
        seeded.photoIds["IMG_001.jpg"],
      );
      expect(result).toMatchObject({ ok: true, fileName: "IMG_001.jpg" });
    }
  });

  it("F-20 Unduh semua lists every visible proof and no finished file", async () => {
    const seeded = await seedDelivered(true);
    const files = await listProofDownloads(
      { reader: createDrizzleClientGalleryReader(db) },
      seeded.client,
    );
    expect(files.map((file) => file.fileName)).toEqual(["IMG_001.jpg"]);
    expect(files[0]?.downloadUrl).toBe(
      `/g/${seeded.client.token}/download/${seeded.photoIds["IMG_001.jpg"]}`,
    );
  });

  it("AC-DEL-004 a removed folder's files are no longer served", async () => {
    const { client, photoIds, sourceId } = await seedDelivered(true);
    await db
      .update(gallerySource)
      .set({ removedAt: new Date() })
      .where(eq(gallerySource.id, sourceId));
    expect(await serveClientFile(deps(drive().provider), client, photoIds["E_001.jpg"])).toEqual({
      ok: false,
    });
  });

  it("AC-DEL-005 a file gone from Drive fails alone", async () => {
    const { client, photoIds } = await seedDelivered(true);
    const gone = new Set([await externalIdOf(photoIds["E_002.jpg"])]);
    const { provider } = drive(gone);
    expect(await serveClientFile(deps(provider), client, photoIds["E_002.jpg"])).toEqual({
      ok: false,
    });
    expect(await serveClientFile(deps(provider), client, photoIds["E_001.jpg"])).toMatchObject({
      ok: true,
    });
  });

  it("AC-DEL-006 a file synced after delivery is listed and served without publishing again", async () => {
    const { client } = await seedDelivered(true);
    const { photoIds } = await seedPhotos(
      db,
      { workspaceId: client.workspaceId, galleryId: client.galleryId },
      [{ fileName: "E_003.jpg", kind: "EDITED", folderPath: "edited" }],
    );
    const browse = {
      browse: createDrizzleGalleryBrowseReader(db, { client: true }),
      directImages: true,
      cache: createWorkersClientListCache(null),
    };
    const query = { kind: "EDITED", sourceId: null, path: "", search: "", cursor: null };
    const sources = await browseClientPhotos(browse, client, query);
    expect(sources.editedTotal).toBe(3);
    expect(
      await serveClientFile(deps(drive().provider), client, photoIds["E_003.jpg"]),
    ).toMatchObject({
      ok: true,
    });
  });

  it("BR-DEL-002 before delivery an Edited query reads proofs and reports no finished files", async () => {
    const { client } = await seedDelivered(false);
    const browse = {
      browse: createDrizzleGalleryBrowseReader(db, { client: true }),
      directImages: true,
      cache: createWorkersClientListCache(null),
    };
    const page = await browseClientPhotos(browse, client, {
      kind: "EDITED",
      sourceId: null,
      path: "",
      search: "",
      cursor: null,
    });
    expect([page.editedTotal, page.printTotal]).toEqual([0, 0]);
    expect(JSON.stringify(page)).not.toContain("E_00");
  });

  it("BR-ACC-005 no client view or file result carries the folder ID", async () => {
    const { client, photoIds, sourceId } = await seedDelivered(true);
    const [source] = await db
      .select({ folderId: gallerySource.providerFolderId })
      .from(gallerySource)
      .where(eq(gallerySource.id, sourceId));
    const browse = {
      browse: createDrizzleGalleryBrowseReader(db, { client: true }),
      directImages: true,
      cache: createWorkersClientListCache(null),
    };
    const pages = await Promise.all(
      (["EDITED", "PRINT"] as const).map((kind) =>
        browseClientPhotos(browse, client, {
          kind,
          sourceId: null,
          path: "",
          search: "",
          cursor: null,
        }),
      ),
    );
    const served = await serveClientFile(deps(drive().provider), client, photoIds["E_001.jpg"]);
    const text = JSON.stringify({ pages, served: { ...served, body: undefined } });
    expect(text).not.toContain(source.folderId);
  });
});
