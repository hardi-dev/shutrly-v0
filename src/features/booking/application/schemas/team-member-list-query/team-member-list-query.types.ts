import type { z } from "zod";

import type { teamMemberListQuerySchema } from "./team-member-list-query.schema";

export type TeamMemberListQuery = z.output<typeof teamMemberListQuerySchema>;
