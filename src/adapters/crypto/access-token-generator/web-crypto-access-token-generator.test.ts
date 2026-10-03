import { describe, expect, it } from "vitest";

import { createWebCryptoAccessTokenGenerator } from "./web-crypto-access-token-generator";

describe("web crypto access token generator (BR-PRJ-003, ADR-004)", () => {
  it("BR-PRJ-003 makes a 43-character URL-safe token from 256 bits", () => {
    const token = createWebCryptoAccessTokenGenerator()();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("BR-PRJ-003 never repeats across 1,000 tokens", () => {
    const generate = createWebCryptoAccessTokenGenerator();
    const tokens = new Set(Array.from({ length: 1000 }, () => generate()));
    expect(tokens.size).toBe(1000);
  });
});
