import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "./error";
import { ERROR_COPY } from "./error.copy";

function inLocale(locale: "en" | "id", ui: ReactNode) {
  const messages = { [ERROR_COPY.namespace]: ERROR_COPY.messages[locale] };
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("error boundary page", () => {
  it("AC-FND-010 shows a generic message without the error details", () => {
    const error = Object.assign(new Error("connect failed postgresql://user:pw@host/db"), {
      digest: "123",
    });
    render(inLocale("id", <ErrorPage error={error} reset={vi.fn()} />));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Ada kendala");
    expect(document.body.textContent).not.toContain("postgresql");
    expect(document.body.textContent).not.toContain("connect failed");
  });

  it("AC-L10N-002 shows the English route error copy in en", () => {
    render(inLocale("en", <ErrorPage error={new Error("x")} reset={vi.fn()} />));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Something went wrong");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("AC-FND-010 retries with reset", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(inLocale("id", <ErrorPage error={new Error("x")} reset={reset} />));
    await user.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
