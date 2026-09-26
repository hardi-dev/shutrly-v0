import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";

import { logger, REDACTED } from "./logger";

type ConsoleSpy = MockInstance<typeof console.log>;

let log: ConsoleSpy;
let warn: ConsoleSpy;
let error: ConsoleSpy;

beforeEach(() => {
  log = vi.spyOn(console, "log").mockImplementation(() => {});
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  error = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

function lastLine(spy: ConsoleSpy): Record<string, unknown> {
  const call = spy.mock.calls.at(-1);
  expect(call).toHaveLength(1);
  return JSON.parse(String(call?.[0])) as Record<string, unknown>;
}

describe("logger", () => {
  it("AC-FND-011 writes one JSON line with level, event and time", () => {
    logger.info("project.created", { workspaceId: "w1", requestId: "r1" });
    const line = lastLine(log);
    expect(line).toMatchObject({
      level: "info",
      event: "project.created",
      workspaceId: "w1",
      requestId: "r1",
    });
    expect(typeof line.time).toBe("string");
  });

  it("AC-FND-011 routes warn and error to the matching console method", () => {
    logger.warn("a.warn");
    logger.error("a.error");
    expect(lastLine(warn)).toMatchObject({ level: "warn", event: "a.warn" });
    expect(lastLine(error)).toMatchObject({ level: "error", event: "a.error" });
  });

  it("AC-FND-011 redacts secret and PII keys", () => {
    logger.info("x", {
      password: "p",
      newPassword: "p",
      sessionToken: "t",
      cookie: "c",
      clientSecret: "s",
      apiKey: "k",
      api_key: "k",
      authorization: "Bearer x",
      email: "a@b.id",
      clientPhone: "0812",
      driveUrl: "https://drive.google.com/x",
      whatsappURL: "https://wa.me/1",
      callback_url: "https://x",
      projectId: "p1",
    });
    const line = lastLine(log);
    for (const key of [
      "password",
      "newPassword",
      "sessionToken",
      "cookie",
      "clientSecret",
      "apiKey",
      "api_key",
      "authorization",
      "email",
      "clientPhone",
      "driveUrl",
      "whatsappURL",
      "callback_url",
    ]) {
      expect(line[key], key).toBe(REDACTED);
    }
    expect(line.projectId).toBe("p1");
  });

  it("AC-FND-011 redacts nested objects and arrays and survives cycles", () => {
    const cyclic: Record<string, unknown> = { name: "loop" };
    cyclic.self = cyclic;
    logger.info("x", {
      user: { email: "a@b.id", id: "u1" },
      links: [{ url: "https://x" }],
      cyclic,
    });
    const line = lastLine(log);
    expect(line.user).toEqual({ email: REDACTED, id: "u1" });
    expect(line.links).toEqual([{ url: REDACTED }]);
    expect(line.cyclic).toEqual({ name: "loop", self: "[Circular]" });
  });

  it("AC-FND-011 serialises errors and scrubs URLs from them", () => {
    logger.error("db.failed", {
      error: new Error("connect failed for postgresql://user:pw@host/db"),
    });
    const serialised = lastLine(error).error as { name: string; message: string; stack?: string };
    expect(serialised.name).toBe("Error");
    expect(serialised.message).toBe("connect failed for [REDACTED_URL]");
    expect(serialised.stack ?? "").not.toContain("pw@host");
  });

  it("AC-FND-011 keeps level and event authoritative over fields", () => {
    logger.info("real.event", { event: "spoofed", level: "error" });
    expect(lastLine(log)).toMatchObject({ level: "info", event: "real.event" });
  });
});
