// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useSequentialDownload } from "./use-sequential-download";

const ITEMS = ["E_001.jpg", "E_002.jpg", "P_001.jpg"].map((fileName, index) => ({
  id: `id-${String(index)}`,
  url: `/g/t/unduh/id-${String(index)}`,
  fileName,
}));

function setup(failing: ReadonlySet<string> = new Set()) {
  const save = vi.fn<(blob: Blob, fileName: string) => void>();
  const fetchFn = vi.fn((url: string) =>
    Promise.resolve(
      [...failing].some((id) => url.endsWith(id))
        ? new Response(null, { status: 404 })
        : new Response("bytes"),
    ),
  );
  const hook = renderHook(() => useSequentialDownload({ fetchFn, save }));
  return { hook, save, fetchFn };
}

describe("useSequentialDownload (D-18, A-33)", () => {
  it("AC-DEL-003 downloads one file after another and counts them", async () => {
    const { hook, save, fetchFn } = setup();
    act(() => {
      hook.result.current.start(ITEMS);
    });
    await waitFor(() => {
      expect(hook.result.current.progress.phase).toBe("DONE");
    });
    expect(hook.result.current.progress).toEqual({
      phase: "DONE",
      done: 3,
      total: 3,
      failedIds: [],
    });
    expect(fetchFn.mock.calls.map((call) => call[0])).toEqual(ITEMS.map((item) => item.url));
    expect(save.mock.calls.map((call) => call[1])).toEqual(["E_001.jpg", "E_002.jpg", "P_001.jpg"]);
  });

  it("AC-DEL-005 a failed file is reported and the others still arrive; Coba lagi retries only it", async () => {
    const { hook, save, fetchFn } = setup(new Set(["id-1"]));
    act(() => {
      hook.result.current.start(ITEMS);
    });
    await waitFor(() => {
      expect(hook.result.current.progress.phase).toBe("DONE");
    });
    expect(hook.result.current.progress.failedIds).toEqual(["id-1"]);
    expect(save).toHaveBeenCalledTimes(2);
    fetchFn.mockClear();
    act(() => {
      hook.result.current.retry();
    });
    await waitFor(() => {
      expect(hook.result.current.progress).toMatchObject({ phase: "DONE", total: 1 });
    });
    expect(fetchFn.mock.calls.map((call) => call[0])).toEqual(["/g/t/unduh/id-1"]);
  });

  it("Batalkan stops before the next file", async () => {
    const save = vi.fn();
    let release: () => void = () => undefined;
    const fetchFn = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          release = () => {
            resolve(new Response("bytes"));
          };
        }),
    );
    const hook = renderHook(() => useSequentialDownload({ fetchFn, save }));
    act(() => {
      hook.result.current.start(ITEMS);
    });
    await waitFor(() => {
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
    act(() => {
      hook.result.current.cancel();
    });
    await act(async () => {
      release();
      await Promise.resolve();
    });
    expect(hook.result.current.progress.phase).toBe("CANCELLED");
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("uses the browser's fetch by default without an illegal invocation", async () => {
    const save = vi.fn();
    const native = vi.fn(function (this: unknown) {
      // The real fetch throws when called with an object as `this`.
      if (this !== undefined && this !== globalThis) throw new TypeError("Illegal invocation");
      return Promise.resolve(new Response("bytes"));
    });
    vi.stubGlobal("fetch", native);
    const hook = renderHook(() => useSequentialDownload({ save }));
    act(() => {
      hook.result.current.start(ITEMS.slice(0, 1));
    });
    await waitFor(() => {
      expect(hook.result.current.progress.phase).toBe("DONE");
    });
    expect(hook.result.current.progress.failedIds).toEqual([]);
    vi.unstubAllGlobals();
  });
});
