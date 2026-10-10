import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";

import type { AppLocale } from "@/shared/locale/locale.types";

import { copyMessages } from "./copy-messages";

/**
 * Render a screen inside a real next-intl provider with the registered copy for one locale, so
 * tests read the same messages the app serves.
 * @param ui - the element to render
 * @param locale - the locale to render in
 * @returns the testing-library render result
 */
export function renderInLocale(ui: ReactElement, locale: AppLocale) {
  return render(
    <NextIntlClientProvider locale={locale} messages={copyMessages(locale)}>
      {ui}
    </NextIntlClientProvider>,
  );
}
