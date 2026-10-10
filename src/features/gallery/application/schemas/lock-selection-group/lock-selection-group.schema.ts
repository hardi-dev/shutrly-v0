import { z } from "zod";

import { selectionGroupIdSchema } from "../gallery-ids/gallery-ids.schema";

// *Kunci pilihan* locks a submitted group, *Tutup pilihan* closes an open one (D-13).
export const lockSelectionGroupSchema = z.object({
  groupId: selectionGroupIdSchema,
  intent: z.enum(["LOCK", "CLOSE"]),
});
