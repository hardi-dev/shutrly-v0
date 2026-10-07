import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../request-context/request-context", () => ({ getScopedBindings: vi.fn() }));

import { getScopedBindings } from "../request-context/request-context";
import { isLandingOnly } from "./app-stage";

beforeEach(() => vi.clearAllMocks());

describe("isLandingOnly", () => {
  it("AC-LND-013 is true on production", async () => {
    vi.mocked(getScopedBindings).mockResolvedValue({ APP_STAGE: "production" });
    expect(await isLandingOnly()).toBe(true);
  });

  it("AC-LND-014 is false on development and test", async () => {
    vi.mocked(getScopedBindings).mockResolvedValue({ APP_STAGE: "development" });
    expect(await isLandingOnly()).toBe(false);
  });

  it("ADR-021 fails closed when the stage can't be read", async () => {
    vi.mocked(getScopedBindings).mockRejectedValue(new Error("Invalid environment"));
    expect(await isLandingOnly()).toBe(true);
  });
});
