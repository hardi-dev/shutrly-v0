import { describe, expect, it, vi } from "vitest";

import { SELECTION_WRITES_PER_SESSION } from "@/features/gallery/domain/client-access-limits/client-access-limits";

import { countSelectionWrite } from "./selection-write-limit";

describe("countSelectionWrite (D-6)", () => {
  it("BR-ACC-004 counts one write per session against the selection-write limit", async () => {
    const hit = vi.fn(() => Promise.resolve(false));
    const allowed = await countSelectionWrite({ hit, peek: vi.fn() }, "abc");
    expect(allowed).toBe(false);
    expect(hit).toHaveBeenCalledWith("client:sel:abc", SELECTION_WRITES_PER_SESSION);
  });
});
