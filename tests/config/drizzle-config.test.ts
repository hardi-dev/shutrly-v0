import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("drizzle.config", () => {
  it("AC-FND-016 migrations use the unpooled (direct) URL, never the pooled one", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://pooled.example/app");
    vi.stubEnv("DATABASE_URL_UNPOOLED", "postgresql://direct.example/app");
    const { default: config } = await import("../../drizzle.config");
    expect(config).toMatchObject({
      dialect: "postgresql",
      out: "./drizzle",
      dbCredentials: { url: "postgresql://direct.example/app" },
    });
  });

  it("AC-FND-016 refuses to run without DATABASE_URL_UNPOOLED", async () => {
    vi.stubEnv("DATABASE_URL_UNPOOLED", "");
    await expect(import("../../drizzle.config")).rejects.toThrow(/DATABASE_URL_UNPOOLED/);
  });
});
