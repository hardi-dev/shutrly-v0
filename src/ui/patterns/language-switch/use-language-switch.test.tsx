import { act, renderHook, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { showToast } from "@/ui/patterns/toast/toast";

import { LANGUAGE_SWITCH_COPY, LANGUAGE_SWITCH_COPY_NAMESPACE } from "./language-switch.copy";
import { useLanguageSwitch } from "./use-language-switch";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

function LanguageWrapper({ children }: Readonly<{ children: ReactNode }>) {
  const messages = { [LANGUAGE_SWITCH_COPY_NAMESPACE]: LANGUAGE_SWITCH_COPY.messages.en };
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

describe("useLanguageSwitch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-L10N-004 a switch refreshes the page and keeps the route", async () => {
    const action = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() => useLanguageSwitch("en", action), {
      wrapper: LanguageWrapper,
    });

    await act(() => result.current.selectLocale("id"));

    expect(action).toHaveBeenCalledWith("id");
    expect(refresh).toHaveBeenCalledOnce();
    expect(showToast).not.toHaveBeenCalled();
  });

  it("AC-L10N-004 choosing the current language does nothing", async () => {
    const action = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() => useLanguageSwitch("en", action), {
      wrapper: LanguageWrapper,
    });

    await act(() => result.current.selectLocale("en"));

    expect(action).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("AC-L10N-001 a failed switch shows the deck failure toast and keeps the old language", async () => {
    const action = vi.fn().mockResolvedValue(false);
    const { result } = renderHook(() => useLanguageSwitch("en", action), {
      wrapper: LanguageWrapper,
    });

    await act(() => result.current.selectLocale("id"));

    expect(refresh).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith({
      tone: "danger",
      title: "Couldn’t change the language. Try again.",
    });
    expect(result.current.pendingLocale).toBeNull();
  });

  it("a pending switch exposes the chosen locale", async () => {
    let resolveSave: ((saved: boolean) => void) | undefined;
    const action = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveSave = resolve;
        }),
    );
    const { result } = renderHook(() => useLanguageSwitch("en", action), {
      wrapper: LanguageWrapper,
    });

    act(() => {
      void result.current.selectLocale("id");
    });
    expect(result.current.pendingLocale).toBe("id");

    act(() => {
      resolveSave?.(true);
    });
    await waitFor(() => {
      expect(result.current.pendingLocale).toBeNull();
    });
  });
});
