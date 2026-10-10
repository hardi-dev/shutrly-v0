import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  LANGUAGE_SWITCH_COPY,
  LANGUAGE_SWITCH_COPY_NAMESPACE,
} from "@/ui/patterns/language-switch/language-switch.copy";
import { showToast } from "@/ui/patterns/toast/toast";

import { AuthLanguageSwitch } from "./auth-language-switch";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

function AuthWrapper({ children }: Readonly<{ children: ReactNode }>) {
  const messages = { [LANGUAGE_SWITCH_COPY_NAMESPACE]: LANGUAGE_SWITCH_COPY.messages.id };
  return (
    <NextIntlClientProvider locale="id" messages={messages}>
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

describe("AuthLanguageSwitch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubLgViewport(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("AC-L10N-001 switching to English writes the device locale and refreshes", async () => {
    const action = vi.fn().mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<AuthLanguageSwitch action={action} />, { wrapper: AuthWrapper });

    await user.click(screen.getByRole("button", { name: "Bahasa" }));
    await user.click(await screen.findByRole("menuitem", { name: "English" }));

    await waitFor(() => {
      expect(action).toHaveBeenCalledWith({ locale: "en" });
    });
    await waitFor(() => {
      expect(refresh).toHaveBeenCalledOnce();
    });
    expect(showToast).not.toHaveBeenCalled();
  });

  it("AC-L10N-001 a refused switch shows the failure toast", async () => {
    const action = vi.fn().mockResolvedValue({ ok: false });
    const user = userEvent.setup();
    render(<AuthLanguageSwitch action={action} />, { wrapper: AuthWrapper });

    await user.click(screen.getByRole("button", { name: "Bahasa" }));
    await user.click(await screen.findByRole("menuitem", { name: "English" }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith({
        tone: "danger",
        title: LANGUAGE_SWITCH_COPY.messages.id.failed,
      });
    });
    expect(refresh).not.toHaveBeenCalled();
  });
});
