import { describe, expect, it } from "vitest";

import { passwordKeys, tokenHashOf, unknownTokenKey } from "./client-access-keys";

describe("client access counter keys (D-6, C-103)", () => {
  it("keeps the token and address out of every key", async () => {
    const token = "T".repeat(43);
    const ip = "10.1.2.3";
    const hash = await tokenHashOf(token);
    expect(hash).toMatch(/^[0-9a-f]{32}$/);
    const keys = [await unknownTokenKey(ip), ...(await passwordKeys(hash, ip))];
    for (const key of keys) {
      expect(key).not.toContain(token);
      expect(key).not.toContain(ip);
    }
    expect(new Set(keys).size).toBe(3);
  });
});
