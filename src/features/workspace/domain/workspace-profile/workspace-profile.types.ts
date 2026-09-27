import type { z } from "zod";

import type { workspaceProfileSchema } from "./workspace-profile.schema";

export type WorkspaceProfileInput = z.input<typeof workspaceProfileSchema>;
export type WorkspaceProfile = z.output<typeof workspaceProfileSchema>;
