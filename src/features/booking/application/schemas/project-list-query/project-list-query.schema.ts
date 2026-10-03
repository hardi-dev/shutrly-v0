import { z } from "zod";

export const projectListQuerySchema = z.object({
  tab: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]),
  /** Left unbounded here so an invalid search lists unfiltered in the use case. */
  q: z.string().default(""),
  afterId: z.uuid().nullable().default(null),
});
