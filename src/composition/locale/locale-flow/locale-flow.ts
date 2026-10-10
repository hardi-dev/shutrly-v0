import "server-only";

import { withAuthScope } from "@/composition/auth/auth-scope/auth-scope";
import { redirectOnRefusal } from "@/composition/auth/owner-guard/owner-guard";
import { updateOwnerLocale as updateOwnerLocaleUseCase } from "@/features/auth/application/use-cases/update-owner-locale/update-owner-locale";
import type { UpdateOwnerLocaleResult } from "@/features/auth/application/use-cases/update-owner-locale/update-owner-locale.types";

/**
 * Store the signed-in owner's dashboard language (BR-L10N-001). A non-owner session is redirected.
 * @param values - the untrusted locale value from the Profile control
 * @returns the use-case result
 */
export function updateOwnerLocale(values: unknown): Promise<UpdateOwnerLocaleResult> {
  return redirectOnRefusal(() =>
    withAuthScope((scope) => updateOwnerLocaleUseCase(scope, values, scope.meta.headers)),
  );
}
