import { useTranslations } from "next-intl";

import { workspaceFieldErrorKeySchema } from "@/features/workspace/application/schemas/workspace-fields/workspace-fields.schema";

import {
  WORKSPACE_FIELD_ERROR_COPY_NAMESPACE,
  WORKSPACE_FIELD_ERROR_MESSAGE_KEY,
} from "./workspace-field-error.copy";

/** The field-error translate function. */
export type WorkspaceFieldTranslate = ReturnType<typeof useTranslations>;

/**
 * Translates a workspace field-error key from the shared schema or the server into UI copy.
 * @param message - the React Hook Form error message (a field-error key)
 * @param t - the field-error translate function
 * @returns the localized message, or undefined when there is no known error
 */
export function workspaceFieldErrorText(
  message: string | undefined,
  t: WorkspaceFieldTranslate,
): string | undefined {
  const key = workspaceFieldErrorKeySchema.safeParse(message);
  return key.success ? t(WORKSPACE_FIELD_ERROR_MESSAGE_KEY[key.data]) : undefined;
}

/**
 * A translator for workspace field errors in the current locale.
 * @returns a function that maps a field-error key to its localized message
 */
export function useWorkspaceFieldErrorText(): (message: string | undefined) => string | undefined {
  const t = useTranslations(WORKSPACE_FIELD_ERROR_COPY_NAMESPACE);
  return (message) => workspaceFieldErrorText(message, t);
}
