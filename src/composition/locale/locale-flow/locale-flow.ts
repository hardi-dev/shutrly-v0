import "server-only";

import { z } from "zod";

import { withAuthScope } from "@/composition/auth/auth-scope/auth-scope";
import { redirectOnRefusal } from "@/composition/auth/owner-guard/owner-guard";
import { updateOwnerLocale as updateOwnerLocaleUseCase } from "@/features/auth/application/use-cases/update-owner-locale/update-owner-locale";
import type { UpdateOwnerLocaleResult } from "@/features/auth/application/use-cases/update-owner-locale/update-owner-locale.types";
import { appLocaleSchema } from "@/shared/locale/locale.schema";

import { writeDeviceLocaleCookie } from "../locale-cookies/locale-cookies";
import { type LocaleActionResult } from "./locale-flow.types";

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

const deviceLocaleSchema = z.object({ locale: appLocaleSchema });

/**
 * Store the device language for the whole site (`shutrly_locale`) so the screens before sign-in
 * follow the visitor's choice (D-3). Needs no session, so it works on the landing page too.
 * @param values - the untrusted locale value from the language switch
 * @returns ok, or a refusal that writes nothing when the value is not a supported locale
 */
export async function setDeviceLocale(values: unknown): Promise<LocaleActionResult> {
  const parsed = deviceLocaleSchema.safeParse(values);
  if (!parsed.success) return { ok: false };
  await writeDeviceLocaleCookie(parsed.data.locale);
  return { ok: true };
}
