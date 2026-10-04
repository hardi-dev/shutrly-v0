import { describe, expect, it } from "vitest";

import { createWebCryptoRandomInt } from "./web-crypto-random-int";

describe("web crypto random int (D-4)", () => {
  it("D-4 stays within [0, max) and reaches every value", () => {
    const randomInt = createWebCryptoRandomInt();
    const seen = new Set<number>();
    for (let run = 0; run < 2000; run += 1) {
      const value = randomInt(8);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(8);
      seen.add(value);
    }
    expect(seen.size).toBe(8);
  });
});
