import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LANGUAGE_SWITCH_COPY,
  LANGUAGE_SWITCH_COPY_NAMESPACE,
} from "@/ui/patterns/language-switch/language-switch.copy";

import { LanguageLink } from "./language-link";

function LanguageWrapper({ children }: Readonly<{ children: ReactNode }>) {
  const messages = { [LANGUAGE_SWITCH_COPY_NAMESPACE]: LANGUAGE_SWITCH_COPY.messages.en };
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

function stubLgViewport(matches: boolean) {
  vi.stubGlobal("matchMedia", () => ({
    matches,
    media: "(min-width: 1024px)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function handleNoop() {
  return undefined;
}

describe("LanguageLink", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("AC-L10N-001 lists both languages by self-name and checks the current one", async () => {
    stubLgViewport(true);
    const user = userEvent.setup();
    render(<LanguageLink currentLocale="id" pendingLocale={null} onSelect={handleNoop} />, {
      wrapper: LanguageWrapper,
    });

    await user.click(screen.getByRole("button", { name: "Language" }));

    const english = screen.getByRole("menuitem", { name: "English" });
    const indonesian = screen.getByRole("menuitem", { name: "Bahasa Indonesia" });
    expect(within(english).queryByTestId("menu-item-check")).toBeNull();
    expect(within(indonesian).getByTestId("menu-item-check")).toBeInTheDocument();
  });

  it("AC-L10N-004 shows Changing language… and is not pressable while pending", () => {
    stubLgViewport(true);
    render(<LanguageLink currentLocale="en" pendingLocale="id" onSelect={handleNoop} />, {
      wrapper: LanguageWrapper,
    });

    const trigger = screen.getByRole("button", { name: "Language" });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveTextContent("Changing language…");
  });

  it("opens a bottom sheet below the lg breakpoint", async () => {
    stubLgViewport(false);
    const user = userEvent.setup();
    render(<LanguageLink currentLocale="en" pendingLocale={null} onSelect={handleNoop} />, {
      wrapper: LanguageWrapper,
    });

    await user.click(screen.getByRole("button", { name: "Language" }));

    const sheet = await screen.findByRole("dialog", { name: "Language" });
    expect(within(sheet).getByTestId("sheet-item-check")).toBeInTheDocument();
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
