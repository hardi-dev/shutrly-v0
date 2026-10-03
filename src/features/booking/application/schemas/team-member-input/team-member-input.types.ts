import type { z } from "zod";

import type { teamMemberInputSchema } from "./team-member-input.schema";

/** The form values: raw strings and the chosen role IDs. */
export type TeamMemberInput = z.input<typeof teamMemberInputSchema>;
/** The stored fields: trimmed name, WhatsappNumber, lower-case email or null, unique role IDs. */
export type TeamMemberFields = z.output<typeof teamMemberInputSchema>;
