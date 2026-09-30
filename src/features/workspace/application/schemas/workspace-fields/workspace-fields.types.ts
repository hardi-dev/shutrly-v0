import type { z } from "zod";

import type { workspaceFieldErrorKeySchema } from "./workspace-fields.schema";

export type WorkspaceFieldErrorKey = z.infer<typeof workspaceFieldErrorKeySchema>;
