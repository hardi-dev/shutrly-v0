import { describe, expect, it, vi } from "vitest";

vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn() }));

const { OWNER_MEDIA_HEADERS } = await import("./gallery-media");

describe("owner media headers (D-10)", () => {
  it("AC-GAL-015 caches privately for 10 minutes and forbids sniffing", () => {
    expect(OWNER_MEDIA_HEADERS).toEqual({
      "Cache-Control": "private, max-age=600",
      "X-Content-Type-Options": "nosniff",
    });
  });
});
