import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider, useLocale } from "next-intl";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useFormattingLocale } from "./use-formatting-locale";

function Probe() {
  return <p>{useFormattingLocale()}</p>;
}

function wrap(locale: "en" | "id"): ReactNode {
  return (
    <NextIntlClientProvider locale={locale} messages={{}}>
      <Probe />
    </NextIntlClientProvider>
  );
}

describe("useFormattingLocale", () => {
  beforeEach(async () => {
    const actual = await vi.importActual<typeof import("next-intl")>("next-intl");
    vi.mocked(useLocale).mockImplementation(actual.useLocale);
  });

  it("AC-L10N-005 useFormattingLocale follows the provider locale", () => {
    const { unmount } = render(wrap("en"));
    expect(screen.getByText("en-US")).toBeInTheDocument();
    unmount();
    render(wrap("id"));
    expect(screen.getByText("id-ID")).toBeInTheDocument();
  });
});
