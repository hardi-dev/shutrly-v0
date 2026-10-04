import { z } from "zod";

import { teamMemberStatusSchema } from "@/features/booking/domain/team-member/team-member.schema";

/** TD-A-1: q remains unbounded here so an invalid search lists unfiltered in the use case. */
export const teamMemberListQuerySchema = z.object({
  status: teamMemberStatusSchema,
  q: z.string().default(""),
  afterId: z.uuid().nullable().default(null),
});
