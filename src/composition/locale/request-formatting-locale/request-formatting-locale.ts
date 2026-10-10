import "server-only";

import { formattingLocale } from "@/shared/locale/locale";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import { getRequestLocale } from "../request-locale/request-locale";

/**
 * The formatting locale of this request (amounts, quantities, dates), resolved on the server so a
 * browser value can never change how an amount is read (C-004).
 * @returns `en-US` or `id-ID`
 */
export async function getRequestFormattingLocale(): Promise<FormattingLocale> {
  return formattingLocale(await getRequestLocale());
}
