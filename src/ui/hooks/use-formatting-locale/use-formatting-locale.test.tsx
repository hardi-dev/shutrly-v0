import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

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
  it("AC-L10N-005 useFormattingLocale follows the provider locale", () => {
    const { unmount } = render(wrap("en"));
    expect(screen.getByText("en-US")).toBeInTheDocument();
    unmount();
    render(wrap("id"));
    expect(screen.getByText("id-ID")).toBeInTheDocument();
  });
});
