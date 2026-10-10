import { describe, expect, it } from "vitest";

import { liveAddOnTotal } from "./add-on-total";

describe("liveAddOnTotal (addon-dialog-tambah)", () => {
  it("AC-ADD-001 shows quantity × unit price", () => {
    expect(liveAddOnTotal("5", "20000", "id-ID")).toBe("Rp 100.000");
    expect(liveAddOnTotal("1", "Rp 750.000", "id-ID")).toBe("Rp 750.000");
  });

  it("AC-ADD-006 shows Rp 0 until both values are valid", () => {
    expect(liveAddOnTotal("0", "20000", "id-ID")).toBe("Rp 0");
    expect(liveAddOnTotal("", "20000", "id-ID")).toBe("Rp 0");
    expect(liveAddOnTotal("5", "abc", "id-ID")).toBe("Rp 0");
  });
});
