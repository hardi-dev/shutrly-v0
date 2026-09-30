import type { z } from "zod";

import type { WorkspaceFieldErrorKey } from "../../schemas/workspace-fields/workspace-fields.types";
import type { updateWorkspaceProfileSchema } from "./update-workspace-profile.schema";

export type UpdateWorkspaceProfileInput = z.input<typeof updateWorkspaceProfileSchema>;

export type UpdateWorkspaceProfileField = keyof UpdateWorkspaceProfileInput;

export type UpdateWorkspaceProfileFieldErrors = Partial<
  Record<UpdateWorkspaceProfileField, WorkspaceFieldErrorKey>
>;

export interface UpdateWorkspaceProfileFailure {
  readonly ok: false;
  readonly code: "VALIDATION_FAILED" | "DUPLICATE_NAME";
  readonly fieldErrors: UpdateWorkspaceProfileFieldErrors;
}

export type UpdateWorkspaceProfileResult = { readonly ok: true } | UpdateWorkspaceProfileFailure;
