import { z } from "zod";

// A keyset cursor of a browse page (D-12); Pilih's flat grid reuses it (F-10).
export const browseCursorSchema = z.object({ sortKey: z.string().max(4096), id: z.uuid() });

// AC-GAL-028…030, A-13: one folder level or a search, one page at a time.
export const browseQuerySchema = z.object({
  kind: z.enum(["PROOF", "EDITED", "PRINT"]),
  sourceId: z.uuid().nullable(),
  path: z.string().max(1024),
  search: z.string().trim().max(100),
  cursor: browseCursorSchema.nullable(),
});
