import type { z } from "zod";

import type { createProjectInputSchema } from "./create-project-input.schema";

export type CreateProjectInput = z.output<typeof createProjectInputSchema>;
export type CreateProjectFormValues = z.input<typeof createProjectInputSchema>;
