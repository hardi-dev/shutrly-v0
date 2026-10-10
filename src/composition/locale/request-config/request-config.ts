import "server-only";

import type { RequestConfig } from "next-intl/server";

import { isLandingOnly } from "@/composition/app-stage/app-stage";
import { createMessageErrorHandler, messageFallback } from "@/shared/locale/message-errors";

import { messagesFor } from "../message-catalog/message-catalog";
import type { CatalogSurface, CopyModule } from "../message-catalog/message-catalog.types";
import { getRequestLocale } from "../request-locale/request-locale";

const ALL_SURFACES: readonly CatalogSurface[] = ["landing", "auth", "owner", "gallery", "shared"];

/**
 * Build the next-intl request config for this request: one resolved locale, its catalog, the
 * Jakarta time zone and the missing-message contract (D-10). Strict outside production; an
 * unreadable stage counts as production, as in `isLandingOnly`.
 * @param registry - the copy modules, read in `src/app` and passed in (D-8)
 * @returns the request config for next-intl
 */
export async function createRequestConfig(registry: readonly CopyModule[]): Promise<RequestConfig> {
  const locale = await getRequestLocale();
  const strict = !(await isLandingOnly());
  return {
    locale,
    messages: messagesFor(locale, ALL_SURFACES, registry),
    timeZone: "Asia/Jakarta",
    onError: createMessageErrorHandler(locale, strict),
    getMessageFallback: messageFallback,
  };
}
