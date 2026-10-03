import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useProjectActions } from "./use-project-actions";

const { refresh, showToast } = vi.hoisted(() => ({ refresh: vi.fn(), showToast: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));

function setup(result: unknown) {
  const advanceAction = vi.fn(() => Promise.resolve(result));
  const hook = renderHook(() =>
    useProjectActions({
      workspaceId: "ws",
      projectId: "p1",
      advanceAction: advanceAction as never,
    }),
  );
  return { advanceAction, hook };
}

describe("useProjectActions", () => {
  beforeEach(() => {
    refresh.mockClear();
    showToast.mockClear();
  });

  it("AC-PRJ-020 shows the step toast and refreshes after a step", async () => {
    const { advanceAction, hook } = setup(undefined);
    await act(() => hook.result.current.advance("START_SHOOTING"));
    expect(advanceAction).toHaveBeenCalledWith("ws", "p1", "START_SHOOTING");
    expect(showToast).toHaveBeenCalledWith({
      tone: "success",
      title: "Pemotretan dimulai",
      body: "Isi paket dan harga sekarang terkunci.",
    });
    expect(refresh).toHaveBeenCalled();
    expect(hook.result.current.pendingStep).toBeNull();
  });

  it("AC-PRJ-009 explains that a session is needed and does not refresh", async () => {
    const { hook } = setup({ ok: false, code: "SESSION_REQUIRED" });
    await act(() => hook.result.current.advance("CONFIRM_BOOKING"));
    expect(showToast).toHaveBeenCalledWith({
      tone: "danger",
      title: "Tambahkan minimal satu sesi sebelum konfirmasi booking.",
    });
    expect(refresh).not.toHaveBeenCalled();
  });

  it("AC-PRJ-021 tells the owner the status changed and reloads", async () => {
    const { hook } = setup({ ok: false, code: "STALE" });
    await act(() => hook.result.current.advance("START_SHOOTING"));
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ tone: "danger", title: "Status proyek sudah berubah" }),
    );
    expect(refresh).toHaveBeenCalled();
  });

  it("AC-PRJ-020 offers Coba lagi when the server throws", async () => {
    const advanceAction = vi.fn(() => Promise.reject(new Error("boom")));
    const hook = renderHook(() =>
      useProjectActions({ workspaceId: "ws", projectId: "p1", advanceAction }),
    );
    await act(() => hook.result.current.advance("START_SHOOTING"));
    expect(showToast.mock.calls.at(0)?.[0]).toMatchObject({
      tone: "danger",
      title: "Perubahan belum tersimpan",
      action: { label: "Coba lagi" },
    });
    expect(hook.result.current.pendingStep).toBeNull();
  });
});
