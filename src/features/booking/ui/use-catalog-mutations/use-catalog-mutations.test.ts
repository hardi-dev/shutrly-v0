// @vitest-environment jsdom

import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const showToast = vi.fn();
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));

const { useCatalogMutations } = await import("./use-catalog-mutations");

describe("useCatalogMutations", () => {
  it("AC-CAT-009 returns field errors and shows success for a category", async () => {
    const add = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useCatalogMutations("ws-1", { addCategory: add }));
    await expect(result.current.addCategory({ name: "Wisuda" })).resolves.toBeUndefined();
    expect(add).toHaveBeenCalledWith("ws-1", { name: "Wisuda" });
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: "success" }));
  });

  it("AC-CAT-022 keeps a server failure result without showing success", async () => {
    const failure = {
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { name: "NAME_TAKEN" },
    } as const;
    const add = vi.fn().mockResolvedValue(failure);
    const { result } = renderHook(() => useCatalogMutations("ws-1", { addCategory: add }));
    await expect(result.current.addCategory({ name: "Wisuda" })).resolves.toEqual(failure);
    expect(showToast).not.toHaveBeenCalled();
  });

  it("AC-CAT-022 turns an exception into a danger toast", async () => {
    const add = vi.fn().mockRejectedValue(new Error("db down"));
    const { result } = renderHook(() => useCatalogMutations("ws-1", { addCategory: add }));
    await expect(result.current.addCategory({ name: "Wisuda" })).resolves.toBeUndefined();
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: "danger" }));
    });
  });
});
