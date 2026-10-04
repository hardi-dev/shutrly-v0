import type { z } from "zod";

import type { teamMemberStatusSchema } from "./team-member.schema";

export type TeamMemberStatus = z.output<typeof teamMemberStatusSchema>;
