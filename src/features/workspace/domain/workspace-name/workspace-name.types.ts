import type { z } from "zod";

import type { workspaceNameSchema } from "./workspace-name.schema";

export type WorkspaceName = z.infer<typeof workspaceNameSchema>;
