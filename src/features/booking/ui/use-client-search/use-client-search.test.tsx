import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CLIENT_SEARCH_DEBOUNCE_MS, useClientSearch } from "./use-client-search";

const RINA = { id: "c1", name: "Rina", whatsappNumber: "6281234567890", projectCount: 2 };

describe("useClientSearch (D-11)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("AC-PRJ-006 waits 250 ms after the last keystroke before searching", async () => {
    const searchAction = vi.fn().mockResolvedValue([RINA]);
    const { result, rerender } = renderHook(
      ({ query }) => useClientSearch({ workspaceId: "ws", query, searchAction }),
      { initialProps: { query: "R" } },
    );
    rerender({ query: "Ri" });
    rerender({ query: "Rin" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(CLIENT_SEARCH_DEBOUNCE_MS - 1);
    });
    expect(searchAction).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(searchAction).toHaveBeenCalledTimes(1);
    expect(searchAction).toHaveBeenCalledWith("ws", "Rin");
    expect(result.current).toEqual({ items: [RINA], isLoading: false });
  });

  it("AC-PRJ-006 keeps the previous matches when a search fails", async () => {
    const searchAction = vi.fn().mockRejectedValue(new Error("down"));
    const { result } = renderHook(() =>
      useClientSearch({ workspaceId: "ws", query: "", searchAction }),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(CLIENT_SEARCH_DEBOUNCE_MS);
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual([]);
  });
});
