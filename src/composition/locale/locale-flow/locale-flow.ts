import "server-only";

import { z } from "zod";

import { withAuthScope } from "@/composition/auth/auth-scope/auth-scope";
import { redirectOnRefusal } from "@/composition/auth/owner-guard/owner-guard";
import { withClientScope } from "@/composition/gallery/client-access-flow/client-access-flow";
import { updateOwnerLocale as updateOwnerLocaleUseCase } from "@/features/auth/application/use-cases/update-owner-locale/update-owner-locale";
import type { UpdateOwnerLocaleResult } from "@/features/auth/application/use-cases/update-owner-locale/update-owner-locale.types";
import { checkGalleryLocaleTarget } from "@/features/gallery/application/use-cases/check-gallery-locale-target/check-gallery-locale-target";
import { appLocaleSchema } from "@/shared/locale/locale.schema";

import {
  writeDeviceLocaleCookie,
  writeGalleryLocaleCookie,
} from "../locale-cookies/locale-cookies";
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

/**
 * Store a visitor's language for one gallery link only (`shutrly_gallery_locale`, `Path=/g/<token>`).
 * It writes only when the link is available, so an unknown token gets nothing (C-104).
 * @param rawToken - the raw token from the gallery path
 * @param values - the untrusted locale value from the client language switch
 * @returns ok, or a refusal that writes nothing
 */
export async function setGalleryLocale(
  rawToken: string,
  values: unknown,
): Promise<LocaleActionResult> {
  const parsed = deviceLocaleSchema.safeParse(values);
  if (!parsed.success) return { ok: false };
  const available = await withClientScope((deps, rc) =>
    checkGalleryLocaleTarget(deps, rawToken, rc.ip),
  );
  if (!available) return { ok: false };
  await writeGalleryLocaleCookie(rawToken, parsed.data.locale);
  return { ok: true };
}
