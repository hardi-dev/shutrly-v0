import type { z } from "zod";

import type { updateWorkspaceProfileSchema } from "./update-workspace-profile.schema";

export type UpdateWorkspaceProfileInput = z.input<typeof updateWorkspaceProfileSchema>;
