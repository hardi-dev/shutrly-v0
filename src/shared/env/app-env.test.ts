import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import { describe, expect, it } from "vitest";

import { parseAppEnv } from "./app-env";

const valid = {
  ...TEST_APP_ENV,
  DATABASE_URL: "postgresql://user:pw@db.example.neon.tech/app?sslmode=require",
};

describe("parseAppEnv", () => {
  it("AC-FND-004 accepts a valid environment and drops unknown bindings", () => {
    expect(parseAppEnv({ ...valid, ASSETS: {} })).toEqual(valid);
  });

  it("AC-FND-004 names a missing key", () => {
    const withoutUrl = Object.fromEntries(
      Object.entries(valid).filter(([key]) => key !== "DATABASE_URL"),
    );
    expect(() => parseAppEnv(withoutUrl)).toThrow("Invalid environment: DATABASE_URL");
  });

  it("AC-FND-004 names every invalid key", () => {
    expect(() => parseAppEnv({ ...valid, DATABASE_URL: "nope", APP_STAGE: "staging" })).toThrow(
      "Invalid environment: DATABASE_URL, APP_STAGE",
    );
  });

  it("AC-FND-004 never echoes a value", () => {
    let message = "";
    try {
      parseAppEnv({ ...valid, DATABASE_URL: "not-a-url-supersecret123" });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toBe("Invalid environment: DATABASE_URL");
    expect(message).not.toContain("supersecret123");
  });
});
