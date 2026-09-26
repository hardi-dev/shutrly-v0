import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/logging/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { logger } from "@/shared/logging/logger";

import { onRequestError } from "./instrumentation";

beforeEach(() => vi.clearAllMocks());

describe("onRequestError", () => {
  it("AC-FND-010 logs the route pattern with the request ID, never the raw path", async () => {
    const error = new Error("boom");
    await onRequestError(
      error,
      { path: "/g/secret-token-123?pw=1", method: "GET", headers: { "cf-ray": "ray-1" } },
      {
        routerKind: "App Router",
        routePath: "/g/[token]",
        routeType: "render",
        revalidateReason: undefined,
      } as never,
    );
    expect(logger.error).toHaveBeenCalledWith("request.unhandled_error", {
      requestId: "ray-1",
      method: "GET",
      routePath: "/g/[token]",
      routeType: "render",
      error,
    });
    expect(JSON.stringify(vi.mocked(logger.error).mock.calls)).not.toContain("secret-token-123");
  });

  it("AC-FND-010 falls back to an unknown request ID", async () => {
    await onRequestError(new Error("x"), { path: "/", method: "POST", headers: {} }, {
      routerKind: "App Router",
      routePath: "/",
      routeType: "action",
      revalidateReason: undefined,
    } as never);
    expect(vi.mocked(logger.error).mock.calls[0]?.[1]).toMatchObject({ requestId: "unknown" });
  });
});
