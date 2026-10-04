import { z } from "zod";

import { teamRoleNameSchema } from "@/features/booking/domain/team-role/team-role.schema";

export const teamRoleInputSchema = z.object({ name: teamRoleNameSchema });
