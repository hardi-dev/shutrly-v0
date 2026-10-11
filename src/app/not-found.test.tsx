import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import NotFound from "./not-found";
import { NOT_FOUND_COPY } from "./not-found.copy";

vi.mock("next-intl/server", () => ({
  getLocale: () => Promise.resolve("en"),
  getTranslations: () => Promise.resolve((key: string) => NOT_FOUND_COPY.messages.en[key] ?? ""),
}));

describe("NotFound", () => {
  it("AC-LND-013 says the page isn't available, with a way back to the landing page", async () => {
    const markup = renderToStaticMarkup(await NotFound());
    expect(markup).toContain(NOT_FOUND_COPY.messages.en.title);
    expect(markup).toContain(NOT_FOUND_COPY.messages.en.body);
    expect(markup).toContain('href="/"');
    expect(markup).toContain(NOT_FOUND_COPY.messages.en.home);
  });

  it("AC-L10N-002 renders the page in the request locale", async () => {
    const markup = renderToStaticMarkup(await NotFound());
    expect(markup).toContain('lang="en"');
  });
});
