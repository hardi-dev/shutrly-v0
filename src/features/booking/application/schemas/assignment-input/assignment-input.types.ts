import type { z } from "zod";

import type { assignmentInputSchema } from "./assignment-input.schema";

export type AssignmentInput = z.output<typeof assignmentInputSchema>;
