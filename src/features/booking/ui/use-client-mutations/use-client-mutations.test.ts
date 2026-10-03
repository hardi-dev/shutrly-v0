// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ToastContent } from "@/ui/patterns/toast/toast.types";

const showToast = vi.fn<(content: ToastContent) => void>();

vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));

const { useClientMutations } = await import("./use-client-mutations");

describe("useClientMutations", () => {
  it("toasts the added client with its name", async () => {
    const { result } = renderHook(() => useClientMutations());
    await result.current.run("Rina Wedding", () => Promise.resolve(undefined));
    expect(showToast).toHaveBeenCalledWith({
      tone: "success",
      title: "Klien ditambahkan",
      body: "Rina Wedding siap dipilih saat membuat proyek.",
    });
  });

  it("toasts a retryable error and repeats the same call", async () => {
    const call = vi
      .fn<() => Promise<undefined>>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useClientMutations());
    await expect(result.current.run("Rina", call)).rejects.toThrow("offline");
    const retry = showToast.mock.calls.at(-1)?.[0].action;
    if (!retry) throw new Error("Retry action was not shown");
    retry.onAction();
    await vi.waitFor(() => {
      expect(call).toHaveBeenCalledTimes(2);
    });
  });
});
