"use server";

import { setDeviceLocale } from "@/composition/locale/locale-flow/locale-flow";
import type {
  LocaleActionResult,
  LocaleInput,
} from "@/composition/locale/locale-flow/locale-flow.types";

export async function setDeviceLocaleAction(values: LocaleInput): Promise<LocaleActionResult> {
  return setDeviceLocale(values);
}
