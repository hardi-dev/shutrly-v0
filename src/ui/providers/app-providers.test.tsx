import { render, screen } from "@testing-library/react";
import { useLocale, useTranslations } from "next-intl";
import { useLocale as useAriaLocale } from "react-aria-components";
import { describe, expect, it, vi } from "vitest";

import { AppProviders } from "./app-providers";

function Probe() {
  const intlLocale = useLocale();
  const ariaLocale = useAriaLocale().locale;
  return <p>{`${intlLocale}|${ariaLocale}`}</p>;
}

function Translated() {
  const t = useTranslations("probe");
  return <p>{t("missing")}</p>;
}

describe("AppProviders", () => {
  it("AC-L10N-005 renders next-intl and React Aria in en", () => {
    render(
      <AppProviders locale="en" messages={{}} strictMessages={false}>
        <Probe />
      </AppProviders>,
    );
    expect(screen.getByText("en|en-US")).toBeInTheDocument();
  });

  it("AC-L10N-005 renders next-intl and React Aria in id", () => {
    render(
      <AppProviders locale="id" messages={{}} strictMessages={false}>
        <Probe />
      </AppProviders>,
    );
    expect(screen.getByText("id|id-ID")).toBeInTheDocument();
  });

  it("AC-L10N-003 the client provider throws on a missing message when strict", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      render(
        <AppProviders locale="en" messages={{ probe: {} }} strictMessages>
          <Translated />
        </AppProviders>,
      ),
    ).toThrow();
  });
});
