import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("next/server", () => ({ after: vi.fn() }));

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { after } from "next/server";
import { z } from "zod";

import { getRequestContext, getScopedRequestContext } from "./request-context";

const waitUntil = vi.fn();
const env = { ...TEST_APP_ENV, ASSETS: {} };

function givenRequest(
  requestHeaders: Record<string, string>,
  bindings: Record<string, unknown> = env,
) {
  vi.mocked(getCloudflareContext).mockResolvedValue({
    env: bindings,
    ctx: { waitUntil },
    cf: undefined,
  });
  vi.mocked(headers).mockResolvedValue(new Headers(requestHeaders));
}

beforeEach(() => vi.clearAllMocks());

describe("getRequestContext", () => {
  it("AC-FND-004 parses the Worker bindings into AppEnv", async () => {
    givenRequest({});
    const rc = await getRequestContext();
    expect(rc.env).toEqual(TEST_APP_ENV);
  });

  it("AC-FND-004 fails fast on invalid bindings", async () => {
    givenRequest({}, { APP_STAGE: "test" });
    await expect(getRequestContext()).rejects.toThrow("Invalid environment: DATABASE_URL");
  });

  it("uses cf-connecting-ip, then the first x-forwarded-for hop, then unknown", async () => {
    givenRequest({ "cf-connecting-ip": "203.0.113.7", "x-forwarded-for": "198.51.100.1" });
    expect((await getRequestContext()).ip).toBe("203.0.113.7");
    givenRequest({ "x-forwarded-for": " 198.51.100.1 , 10.0.0.1" });
    expect((await getRequestContext()).ip).toBe("198.51.100.1");
    givenRequest({});
    expect((await getRequestContext()).ip).toBe("unknown");
  });

  it("uses cf-ray as the request ID, else a random UUID", async () => {
    givenRequest({ "cf-ray": "8f1c2d3e4f5a6b7c-SIN" });
    expect((await getRequestContext()).requestId).toBe("8f1c2d3e4f5a6b7c-SIN");
    givenRequest({});
    expect((await getRequestContext()).requestId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("AC-FND-005 delegates waitUntil to the Worker execution context", async () => {
    givenRequest({});
    const promise = Promise.resolve();
    (await getRequestContext()).waitUntil(promise);
    expect(waitUntil).toHaveBeenCalledWith(promise);
  });
});

describe("getRequestContext on a production Node host (Netlify)", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    for (const [key, value] of Object.entries(TEST_APP_ENV)) vi.stubEnv(key, value);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("reads the bindings from process.env, not the Cloudflare context", async () => {
    vi.mocked(headers).mockResolvedValue(new Headers());
    const rc = await getRequestContext();
    expect(rc.env).toEqual(TEST_APP_ENV);
    expect(getCloudflareContext).not.toHaveBeenCalled();
  });

  it("hands waitUntil work to next's after()", async () => {
    vi.mocked(headers).mockResolvedValue(new Headers());
    const promise = Promise.resolve();
    (await getRequestContext()).waitUntil(promise);
    const callback = vi.mocked(after).mock.calls[0]?.[0] as () => Promise<unknown>;
    expect(await callback()).toBeUndefined();
    expect(callback()).toBe(promise);
  });

  it("uses the Netlify client IP and request ID headers", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "x-nf-client-connection-ip": "203.0.113.9", "x-nf-request-id": "01ABC" }),
    );
    const rc = await getRequestContext();
    expect(rc.ip).toBe("203.0.113.9");
    expect(rc.requestId).toBe("01ABC");
  });
});

describe("getScopedRequestContext", () => {
  const schema = z.object({ ONLY_THIS: z.string() });

  it("ADR-022 checks only the endpoint's own bindings, so a partial environment works", async () => {
    givenRequest({ "cf-ray": "abc-SIN" }, { ONLY_THIS: "yes", APP_STAGE: "production" });
    expect(await getScopedRequestContext(schema)).toEqual({
      env: { ONLY_THIS: "yes" },
      requestId: "abc-SIN",
    });
  });

  it("throws when the endpoint's own bindings are invalid", async () => {
    givenRequest({}, {});
    await expect(getScopedRequestContext(schema)).rejects.toThrow();
  });
});
