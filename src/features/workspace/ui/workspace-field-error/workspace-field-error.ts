import { workspaceFieldErrorKeySchema } from "@/features/workspace/application/schemas/workspace-fields/workspace-fields.schema";

import { WORKSPACE_FIELD_ERROR_COPY } from "./workspace-field-error.copy";

/** Translates a workspace field-error key from the shared schema or the server into UI copy. @param message - the React Hook Form error message (a field-error key) @returns the Indonesian message, or undefined when there is no known error */
export function workspaceFieldErrorText(message: string | undefined): string | undefined {
  const key = workspaceFieldErrorKeySchema.safeParse(message);
  return key.success ? WORKSPACE_FIELD_ERROR_COPY[key.data] : undefined;
}
