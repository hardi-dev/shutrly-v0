import { z } from "zod";

import { fitsTeamRoleNameLength } from "./team-role";

/** BR-TEAM-005: a trimmed role name, or the issue `EMPTY` / `TOO_LONG`. */
export const teamRoleNameSchema = z
  .string()
  .trim()
  .min(1, { error: "EMPTY" })
  .refine(fitsTeamRoleNameLength, { error: "TOO_LONG" });
