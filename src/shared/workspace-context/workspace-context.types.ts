import type { z } from "zod";

import type { workspaceIdSchema } from "./workspace-context.schema";

export type WorkspaceId = z.infer<typeof workspaceIdSchema>;

// Produced only by F-02's workspace resolver after verifying ownership (BR-WS-003).
// Every owner-scoped repository function takes one (coding rules › Data Access).
export interface WorkspaceContext {
  readonly workspaceId: WorkspaceId;
}
