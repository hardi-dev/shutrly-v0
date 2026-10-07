import { and, eq } from "drizzle-orm";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { gallery, gallerySource } from "@/adapters/db/schema/gallery/gallery";
import { setFolderMapping } from "@/features/gallery/application/use-cases/folder-mapping/folder-mapping";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { addProjectItems } from "../client-access/fixture";

/** Maps the fixture's `Edited` and `print` folders to a *Foto edit* and a *Foto cetak* item of the source's project, as the Owner would (F-20). @returns the item ids */
export async function mapFixtureFolders(
  db: Db,
  context: WorkspaceContext,
  sourceId: string,
  paths: { readonly edited: readonly string[]; readonly print: readonly string[] } = {
    edited: ["Edited"],
    print: ["print"],
  },
) {
  const [row] = await db
    .select({ projectId: gallery.projectId })
    .from(gallerySource)
    .innerJoin(
      gallery,
      and(
        eq(gallery.workspaceId, gallerySource.workspaceId),
        eq(gallery.id, gallerySource.galleryId),
      ),
    )
    .where(and(eq(gallerySource.workspaceId, context.workspaceId), eq(gallerySource.id, sourceId)));
  const ids = await addProjectItems(
    db,
    { workspaceId: context.workspaceId, projectId: row.projectId },
    [
      { name: "Foto edit", value: 10, pickMode: "COUNT" },
      { name: "Foto cetak", value: 5, unit: "lembar", pickMode: "QUANTITY" },
    ],
  );
  const result = await setFolderMapping(
    { sources: createDrizzleGallerySourceRepository(db), now: new Date() },
    context,
    sourceId,
    {
      mappings: [
        ...paths.edited.map((path) => ({ path, projectItemId: ids["Foto edit"] })),
        ...paths.print.map((path) => ({ path, projectItemId: ids["Foto cetak"] })),
      ],
    },
  );
  if (!result.ok) throw new Error(`mapping failed: ${result.code}`);
  return ids;
}
