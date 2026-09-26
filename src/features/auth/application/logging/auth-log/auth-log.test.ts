import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/logging/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { logger } from "@/shared/logging/logger";

import { authLog } from "./auth-log";
import type { AuthLogEvent } from "./auth-log.types";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("authLog", () => {
  it("AC-AUTH-021 forwards only allow-listed fields, even when extra fields sneak in", () => {
    const leaky = {
      operation: "login",
      outcome: "INVALID_CREDENTIALS",
      requestId: "r1",
      password: "hunter22",
      url: "https://x/verify?token=abc",
      email: "a@b.c",
    } as AuthLogEvent;
    authLog(leaky);
    expect(logger.info).toHaveBeenCalledWith("auth", {
      operation: "login",
      outcome: "INVALID_CREDENTIALS",
      requestId: "r1",
      userId: undefined,
      detail: undefined,
    });
    expect(JSON.stringify(vi.mocked(logger.info).mock.calls)).not.toMatch(/hunter22|abc|a@b\.c/);
  });

  it("AC-AUTH-021 logs at the requested level", () => {
    authLog({ operation: "email-send", outcome: "DELIVERY_FAILED", requestId: "r2" }, "error");
    expect(logger.error).toHaveBeenCalledOnce();
  });
});
