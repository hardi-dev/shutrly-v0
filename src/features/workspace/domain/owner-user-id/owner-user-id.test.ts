import { describe, expect, it } from "vitest";

import { asOwnerUserId } from "./owner-user-id";

describe("asOwnerUserId", () => {
  it("accepts an opaque authenticated user ID", () => {
    expect(asOwnerUserId("user_123")).toBe("user_123");
  });

  it("rejects an empty owner user ID", () => {
    expect(() => asOwnerUserId("")).toThrow();
  });
});
