import type { AppLocale } from "@/shared/locale/locale.types";

/** The device-locale save action. Structurally equal to `setDeviceLocaleAction`, so no composition import is needed. */
export type SetDeviceLocaleAction = (values: { locale: AppLocale }) => Promise<{ ok: boolean }>;

export interface AuthLanguageSwitchProps {
  action: SetDeviceLocaleAction;
}
