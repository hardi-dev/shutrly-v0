import { renderHook } from "@testing-library/react";
import { copyMessages } from "@tests/support/copy/copy-messages";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import type { AppLocale } from "@/shared/locale/locale.types";

import { useWorkspaceFieldErrorText } from "./workspace-field-error";

function wrapperFor(locale: AppLocale) {
  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <NextIntlClientProvider locale={locale} messages={copyMessages(locale)}>
        {children}
      </NextIntlClientProvider>
    );
  };
}

function errorTextHook(locale: AppLocale) {
  return renderHook(() => useWorkspaceFieldErrorText(), { wrapper: wrapperFor(locale) }).result
    .current;
}

describe("useWorkspaceFieldErrorText", () => {
  it("AC-WS-017 maps a schema or server error key to its English message", () => {
    const errorText = errorTextHook("en");
    expect(errorText("name.duplicate")).toBe("You already have a workspace with this name.");
    expect(errorText("prefix.invalid")).toBe("Use 2–6 letters or numbers.");
  });

  it("AC-WS-017 maps a schema or server error key to its Indonesian message", () => {
    const errorText = errorTextHook("id");
    expect(errorText("name.duplicate")).toBe("Kamu sudah punya ruang kerja dengan nama ini.");
    expect(errorText("name.required")).toBe("Isi nama ruang kerja.");
  });

  it("returns nothing for no error or an unknown message", () => {
    const errorText = errorTextHook("id");
    expect(errorText(undefined)).toBeUndefined();
    expect(errorText("boom")).toBeUndefined();
  });
});
