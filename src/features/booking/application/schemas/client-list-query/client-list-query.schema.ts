import { z } from "zod";

import { clientStatusSchema } from "@/features/booking/domain/client-list/client-list.schema";

/** TD-A-1: q remains unbounded here so invalid search lists unfiltered in the use case. */
export const clientListQuerySchema = z.object({
  status: clientStatusSchema,
  q: z.string().default(""),
  afterId: z.uuid().nullable().default(null),
});
