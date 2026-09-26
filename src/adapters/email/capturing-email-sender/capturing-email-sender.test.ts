import { describe, expect, it } from "vitest";

import {
  capturedLinks,
  createCapturingEmailSender,
  isEmailCaptureEnabled,
} from "./capturing-email-sender";

const LOCAL = "http://localhost:3000";

describe("capturing email sender (E2E only)", () => {
  it("AC-AUTH-021 is enabled only with the flag on a localhost base URL", () => {
    expect(isEmailCaptureEnabled({ BETTER_AUTH_URL: LOCAL })).toBe(false);
    expect(isEmailCaptureEnabled({ E2E_EMAIL_CAPTURE: "1", BETTER_AUTH_URL: LOCAL })).toBe(true);
    const production = { E2E_EMAIL_CAPTURE: "1", BETTER_AUTH_URL: "https://app.shutrly.com" };
    expect(isEmailCaptureEnabled(production)).toBe(false);
  });

  it("AC-AUTH-004 keeps the links per recipient", async () => {
    const link = { kind: "VERIFY_EMAIL", to: "e2e@x.dev", name: "E", url: "u" } as const;
    await createCapturingEmailSender().send(link);
    expect(capturedLinks("E2E@x.dev")).toEqual([link]);
  });
});
