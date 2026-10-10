import type { z } from "zod";

import type { createProjectInputSchema } from "./create-project-input.schema";

export type CreateProjectInput = z.output<ReturnType<typeof createProjectInputSchema>>;
export type CreateProjectFormValues = z.input<ReturnType<typeof createProjectInputSchema>>;
