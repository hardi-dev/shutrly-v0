import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn() }));

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

import { getRequestContext } from "./request-context";

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
