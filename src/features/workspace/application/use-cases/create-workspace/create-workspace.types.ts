import type { z } from "zod";

import type { createWorkspaceSchema } from "./create-workspace.schema";

export type CreateWorkspaceInput = z.input<typeof createWorkspaceSchema>;
