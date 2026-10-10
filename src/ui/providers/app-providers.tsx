"use client";

import { NextIntlClientProvider } from "next-intl";
import { I18nProvider } from "react-aria-components";

import { formattingLocale } from "@/shared/locale/locale";
import { createMessageErrorHandler, messageFallback } from "@/shared/locale/message-errors";
import { ToastRegion } from "@/ui/patterns/toast/toast";

import type { AppProvidersProps } from "./app-providers.types";

/**
 * Client-side providers for the whole app. One locale drives next-intl and React Aria, so
 * formatting follows the same language as the copy (AC-L10N-005).
 * @param props - the locale, its messages and the strictness flag, then the app tree
 * @returns the tree inside the next-intl and React Aria providers
 */
export function AppProviders({ children, locale, messages, strictMessages }: AppProvidersProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={createMessageErrorHandler(locale, strictMessages)}
      getMessageFallback={messageFallback}
    >
      <I18nProvider locale={formattingLocale(locale)}>
        {children}
        <ToastRegion />
      </I18nProvider>
    </NextIntlClientProvider>
  );
}
