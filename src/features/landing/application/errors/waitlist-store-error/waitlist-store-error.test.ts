import { describe, expect, it } from "vitest";

import { WaitlistStoreError } from "./waitlist-store-error";

describe("WaitlistStoreError", () => {
  it("carries the provider status and a stable code, never the email", () => {
    const error = new WaitlistStoreError(422);
    expect(error.code).toBe("WAITLIST_STORE_FAILED");
    expect(error.status).toBe(422);
    expect(error.message).toBe("Waitlist store failed (HTTP 422)");
  });
});
