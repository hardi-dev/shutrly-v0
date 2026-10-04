import { describe, expect, it } from "vitest";

import { createBetterAuthPasswordHasher } from "./better-auth-password-hasher";

describe("better auth password hasher (D-3)", () => {
  it("BR-GAL-002 hashes a password that verifies, never in plain text", async () => {
    const hasher = createBetterAuthPasswordHasher();
    const hash = await hasher.hash("mawar-4821");
    expect(hash).not.toContain("mawar");
    expect(await hasher.verify(hash, "mawar-4821")).toBe(true);
    expect(await hasher.verify(hash, "mawar-4822")).toBe(false);
  });
});
