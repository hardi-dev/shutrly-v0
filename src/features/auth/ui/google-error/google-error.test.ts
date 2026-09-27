import { describe, expect, it } from "vitest";

import { googleErrorCode } from "./google-error";

describe("googleErrorCode", () => {
  it("AC-AUTH-029 maps a cancelled consent", () => {
    expect(googleErrorCode("access_denied")).toBe("GOOGLE_CANCELLED");
  });

  it("AC-AUTH-028 maps any other provider error to the generic message", () => {
    expect(googleErrorCode("state_mismatch")).toBe("GOOGLE_FAILED");
    expect(googleErrorCode("account not linked")).toBe("GOOGLE_FAILED");
  });

  it("AC-AUTH-029 returns null without an error", () => {
    expect(googleErrorCode(undefined)).toBeNull();
  });
});
