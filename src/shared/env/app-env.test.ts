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

  it("ADR-021 refuses a client session key that isn't 32 bytes", () => {
    expect(() => parseAppEnv({ ...valid, CLIENT_SESSION_KEY: "short" })).toThrow(
      "Invalid environment: CLIENT_SESSION_KEY",
    );
  });

  it("ADR-017 refuses a gallery password key that isn't 32 bytes", () => {
    expect(() => parseAppEnv({ ...valid, GALLERY_PASSWORD_KEY: "A".repeat(42) })).toThrow(
      "Invalid environment: GALLERY_PASSWORD_KEY",
    );
    expect(() => parseAppEnv({ ...valid, GALLERY_PASSWORD_KEY: `${"A".repeat(42)}B` })).toThrow(
      "Invalid environment: GALLERY_PASSWORD_KEY",
    );
  });

  it("ADR-005 requires the Drive API key", () => {
    expect(() => parseAppEnv({ ...valid, GOOGLE_DRIVE_API_KEY: "" })).toThrow(
      "Invalid environment: GOOGLE_DRIVE_API_KEY",
    );
  });

  it("refuses the fake Drive provider on production", () => {
    expect(parseAppEnv({ ...valid, E2E_FAKE_DRIVE: "1" }).E2E_FAKE_DRIVE).toBe("1");
    expect(() => parseAppEnv({ ...valid, APP_STAGE: "production", E2E_FAKE_DRIVE: "1" })).toThrow(
      "Invalid environment: E2E_FAKE_DRIVE",
    );
  });
});
