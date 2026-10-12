import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";

import type { AppLocale } from "@/shared/locale/locale.types";

import { copyMessages } from "../copy/copy-messages";

/**
 * The server markup of a screen, parsed into a DOM tree: the HTML a visitor has before any
 * JavaScript runs (F-24 D1). Rendered inside a real next-intl provider with the registered copy.
 * @param ui - the element to render on the server
 * @param locale - the locale to render in
 * @returns a detached element holding the server markup
 */
export function serverFormDom(ui: ReactElement, locale: AppLocale = "id"): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = renderToString(
    <NextIntlClientProvider locale={locale} messages={copyMessages(locale)}>
      {ui}
    </NextIntlClientProvider>,
  );
  return host;
}

/**
 * The submit button of the first form in a tree.
 * @param root - the element that contains the form
 * @returns the submit button
 */
export function submitButton(root: ParentNode): HTMLButtonElement {
  const button = root.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!button) throw new Error("form has no submit button");
  return button;
}
