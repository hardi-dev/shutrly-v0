"use server";

import { setGalleryLocale } from "@/composition/locale/locale-flow/locale-flow";
import type {
  LocaleActionResult,
  LocaleInput,
} from "@/composition/locale/locale-flow/locale-flow.types";

export async function setGalleryLocaleAction(
  token: string,
  values: LocaleInput,
): Promise<LocaleActionResult> {
  return setGalleryLocale(token, values);
}
