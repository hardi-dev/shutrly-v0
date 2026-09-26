import { describe, expect, it } from "vitest";

import { EmailDeliveryError } from "./email-delivery-error";

describe("EmailDeliveryError", () => {
  it("AC-AUTH-021 names the email kind and status but never a link or recipient", () => {
    const error = new EmailDeliveryError("VERIFY_EMAIL", 503);
    expect(error.code).toBe("EMAIL_DELIVERY_FAILED");
    expect(error.message).toBe("Auth email delivery failed (VERIFY_EMAIL, HTTP 503)");
    expect(new EmailDeliveryError("RESET_PASSWORD").message).toBe(
      "Auth email delivery failed (RESET_PASSWORD)",
    );
  });
});
