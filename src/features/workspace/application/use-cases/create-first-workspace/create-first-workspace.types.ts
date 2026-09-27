import type { z } from "zod";

import type { createFirstWorkspaceSchema } from "./create-first-workspace.schema";

export type CreateFirstWorkspaceInput = z.input<typeof createFirstWorkspaceSchema>;
