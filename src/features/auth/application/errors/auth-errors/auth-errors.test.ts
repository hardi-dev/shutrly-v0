import { describe, expect, it } from "vitest";
import { z } from "zod";

import { AuthError, failure, validationFailure } from "./auth-errors";

function issuesOf(schema: z.ZodType, input: unknown): z.ZodError {
  const parsed = schema.safeParse(input);
  if (parsed.success) throw new Error("expected a validation failure");
  return parsed.error;
}

describe("auth errors", () => {
  it("AC-AUTH-002 maps Zod issues to one message key per field", () => {
    const schema = z.object({
      email: z.email("email.invalid"),
      password: z.string().min(8, "password.length"),
    });
    expect(validationFailure(issuesOf(schema, { email: "nope", password: "short" }))).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { email: "email.invalid", password: "password.length" },
    });
  });

  it("AC-AUTH-002 keeps the first issue when a field has several", () => {
    const schema = z.object({ name: z.string().min(1, "name.required").max(0, "name.tooLong") });
    expect(validationFailure(issuesOf(schema, { name: "" })).fieldErrors).toEqual({
      name: "name.required",
    });
  });

  it("AC-AUTH-002 treats a message that is not a FieldErrorKey as a schema bug", () => {
    const schema = z.object({ name: z.string().min(1, "free text") });
    expect(() => validationFailure(issuesOf(schema, { name: "" }))).toThrow(/FieldErrorKey/);
  });

  it("AC-AUTH-008 builds a plain failure and a throwable error with a stable code", () => {
    expect(failure("RATE_LIMITED")).toEqual({ ok: false, code: "RATE_LIMITED" });
    expect(new AuthError("ACCOUNT_UNAVAILABLE").code).toBe("ACCOUNT_UNAVAILABLE");
  });
});
