import { afterEach, describe, expect, it, vi } from "vitest";

import { createMessageErrorHandler, messageFallback } from "./message-errors";

const missing = { code: "MISSING_MESSAGE", message: "Could not resolve `title`." };

afterEach(() => vi.restoreAllMocks());

describe("missing-message contract", () => {
  it("AC-L10N-003 throws on a missing message outside production", () => {
    expect(() => {
      createMessageErrorHandler("en", true)(missing);
    }).toThrow();
  });

  it("AC-L10N-003 logs l10n.missing_message without user data in production", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => {
      createMessageErrorHandler("id", false)(missing);
    }).not.toThrow();
    expect(error).toHaveBeenCalledTimes(1);
    const line = JSON.parse(String(error.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(line.event).toBe("l10n.missing_message");
    expect(line.locale).toBe("id");
    expect(JSON.stringify(line)).not.toMatch(/token|email|cookie/i);
  });

  it("AC-L10N-003 the fallback is empty, never the key and never the other language", () => {
    expect(messageFallback()).toBe("");
  });
});
