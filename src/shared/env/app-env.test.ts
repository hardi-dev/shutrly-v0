import { describe, expect, it } from "vitest";

import { parseAppEnv } from "./app-env";

const valid = {
  DATABASE_URL: "postgresql://user:pw@db.example.neon.tech/app?sslmode=require",
  APP_STAGE: "test",
};

describe("parseAppEnv", () => {
  it("AC-FND-004 accepts a valid environment and drops unknown bindings", () => {
    expect(parseAppEnv({ ...valid, ASSETS: {} })).toEqual(valid);
  });

  it("AC-FND-004 names a missing key", () => {
    expect(() => parseAppEnv({ APP_STAGE: "test" })).toThrow("Invalid environment: DATABASE_URL");
  });

  it("AC-FND-004 names every invalid key", () => {
    expect(() => parseAppEnv({ DATABASE_URL: "nope", APP_STAGE: "staging" })).toThrow(
      "Invalid environment: DATABASE_URL, APP_STAGE",
    );
  });

  it("AC-FND-004 never echoes a value", () => {
    let message = "";
    try {
      parseAppEnv({ DATABASE_URL: "not-a-url-supersecret123", APP_STAGE: "test" });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toBe("Invalid environment: DATABASE_URL");
    expect(message).not.toContain("supersecret123");
  });
});
