import { z } from "zod";

import { selectionGroupIdSchema } from "../gallery-ids/gallery-ids.schema";

// Kirim from Tinjau; `confirmBelowLimit` is the client's answer to the places-left notice (D-13, A-5).
export const submitSelectionGroupSchema = z.object({
  groupId: selectionGroupIdSchema,
  confirmBelowLimit: z.boolean(),
});
