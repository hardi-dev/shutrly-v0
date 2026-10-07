import { describe, expect, it, vi } from "vitest";

vi.mock("@/composition/app-stage/app-stage", () => ({ isLandingOnly: vi.fn() }));

import { isLandingOnly } from "@/composition/app-stage/app-stage";

import robots from "./robots";

describe("robots", () => {
  it("AC-LND-004 lets production index only the landing page", async () => {
    vi.mocked(isLandingOnly).mockResolvedValue(true);
    expect(await robots()).toEqual({ rules: { userAgent: "*", allow: "/$", disallow: "/" } });
  });

  it("keeps staging and development out of search results", async () => {
    vi.mocked(isLandingOnly).mockResolvedValue(false);
    expect(await robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });
});
