import { z } from "zod";

// D-22: a cached client browse page is re-validated on read before it is used.
const photoSchema = z.object({
  id: z.string(),
  externalFileId: z.string(),
  provider: z.enum(["GOOGLE_DRIVE", "DROPBOX", "ONEDRIVE", "AMAZON_S3", "CUSTOM_URL"]),
  fileName: z.string(),
  kind: z.enum(["PROOF", "EDITED", "PRINT"]),
  folderPath: z.string(),
  browsePath: z.string(),
  sourceId: z.string(),
  sourceName: z.string().nullable(),
  missing: z.boolean(),
  driveUrl: z.string().nullable(),
});

export const browsePageSchema = z.object({
  mode: z.enum(["SOURCES", "FOLDER", "SEARCH"]),
  totals: z.object({ proof: z.number(), edited: z.number(), print: z.number() }),
  sourceId: z.string().nullable(),
  isSingleSource: z.boolean(),
  folders: z.array(
    z.object({ name: z.string(), count: z.number(), sourceId: z.string(), path: z.string() }),
  ),
  summary: z.object({ folderCount: z.number(), photoCount: z.number() }).nullable(),
  photos: z.array(photoSchema),
  nextCursor: z.object({ sortKey: z.string(), id: z.string() }).nullable(),
});
