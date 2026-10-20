import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("next/server", () => ({ after: vi.fn() }));

import { headers } from "next/headers";
import { after } from "next/server";
import { z } from "zod";

import { getRequestContext, getScopedRequestContext } from "./request-context";

// The bindings come from process.env: every app key is blanked, then the given ones are set.
function givenBindings(bindings: Record<string, string> = TEST_APP_ENV) {
  for (const key of Object.keys(TEST_APP_ENV)) vi.stubEnv(key, "");
  for (const [key, value] of Object.entries(bindings)) vi.stubEnv(key, value);
}

function givenRequest(requestHeaders: Record<string, string>) {
  vi.mocked(headers).mockResolvedValue(new Headers(requestHeaders));
}

beforeEach(() => {
  vi.clearAllMocks();
  givenBindings();
});
afterEach(() => vi.unstubAllEnvs());

describe("getRequestContext", () => {
  it("AC-FND-004 parses the process environment into AppEnv", async () => {
    givenRequest({});
    const rc = await getRequestContext();
    expect(rc.env).toEqual(TEST_APP_ENV);
  });

  it("AC-FND-004 fails fast on invalid bindings", async () => {
    givenBindings({ APP_STAGE: "test" });
    givenRequest({});
    await expect(getRequestContext()).rejects.toThrow("Invalid environment: DATABASE_URL");
  });

  it("uses the Netlify client IP, else the first x-forwarded-for hop, else unknown", async () => {
    givenRequest({ "x-nf-client-connection-ip": "203.0.113.9", "x-forwarded-for": "198.51.100.1" });
    expect((await getRequestContext()).ip).toBe("203.0.113.9");
    givenRequest({ "x-forwarded-for": " 198.51.100.1 , 10.0.0.1" });
    expect((await getRequestContext()).ip).toBe("198.51.100.1");
    givenRequest({});
    expect((await getRequestContext()).ip).toBe("unknown");
  });

  it("uses x-nf-request-id as the request ID, else a random UUID", async () => {
    givenRequest({ "x-nf-request-id": "01ABC" });
    expect((await getRequestContext()).requestId).toBe("01ABC");
    givenRequest({});
    expect((await getRequestContext()).requestId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("AC-FND-005 hands waitUntil work to next's after()", async () => {
    givenRequest({});
    const promise = Promise.resolve();
    (await getRequestContext()).waitUntil(promise);
    const callback = vi.mocked(after).mock.calls[0]?.[0] as () => Promise<unknown>;
    expect(callback()).toBe(promise);
  });
});

describe("getScopedRequestContext", () => {
  const schema = z.object({ ONLY_THIS: z.string() });

  it("ADR-022 checks only the endpoint's own bindings, so a partial environment works", async () => {
    givenBindings({ ONLY_THIS: "yes", APP_STAGE: "production" });
    givenRequest({ "x-nf-request-id": "abc-SIN" });
    expect(await getScopedRequestContext(schema)).toEqual({
      env: { ONLY_THIS: "yes" },
      requestId: "abc-SIN",
    });
  });

  it("throws when the endpoint's own bindings are invalid", async () => {
    givenBindings({});
    givenRequest({});
    await expect(getScopedRequestContext(schema)).rejects.toThrow();
  });
});
