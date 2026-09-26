import { describe, expect, it } from "vitest";

import { DomainError } from "./domain-error";

class ExampleError extends DomainError {
  readonly code = "EXAMPLE_ERROR";
}

describe("DomainError", () => {
  it("AC-FND-010 gives subclasses a stable code, their own name and the cause", () => {
    const cause = new Error("root");
    const error = new ExampleError("Example failed", { cause });
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe("EXAMPLE_ERROR");
    expect(error.name).toBe("ExampleError");
    expect(error.message).toBe("Example failed");
    expect(error.cause).toBe(cause);
  });
});
