"use client";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { AppLocale } from "@/shared/locale/locale.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { LANGUAGE_SWITCH_COPY_NAMESPACE } from "./language-switch.copy";
import type { LanguageSwitchAction, LanguageSwitchState } from "./use-language-switch.types";

/**
 * Runs a language switch with the shared pending, refresh and failure feedback.
 * @param currentLocale - the locale the page is shown in; choosing it again does nothing
 * @param action - saves the chosen locale; resolves true when saved
 * @returns the locale being saved and the select handler
 */
export function useLanguageSwitch(
  currentLocale: AppLocale,
  action: LanguageSwitchAction,
): LanguageSwitchState {
  const router = useRouter();
  const t = useTranslations(LANGUAGE_SWITCH_COPY_NAMESPACE);
  const [pendingLocale, setPendingLocale] = useState<AppLocale | null>(null);

  const showFailure = () => {
    showToast({ tone: "danger", title: t("failed") });
  };

  const selectLocale = async (locale: AppLocale): Promise<void> => {
    if (locale === currentLocale) return;
    setPendingLocale(locale);
    try {
      const saved = await action(locale);
      if (saved) {
        router.refresh();
      } else {
        showFailure();
      }
    } catch (error: unknown) {
      if (isRedirectError(error)) throw error;
      showFailure();
    } finally {
      setPendingLocale(null);
    }
  };

  return { pendingLocale, selectLocale };
}
