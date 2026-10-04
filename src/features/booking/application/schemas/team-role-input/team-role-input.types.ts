import type { z } from "zod";

import type { teamRoleInputSchema } from "./team-role-input.schema";

/** The form values: the raw name. */
export type TeamRoleInput = z.input<typeof teamRoleInputSchema>;
/** The stored fields: the trimmed name. */
export type TeamRoleFields = z.output<typeof teamRoleInputSchema>;
