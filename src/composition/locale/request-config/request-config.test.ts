import type { RequestConfig } from "next-intl/server";
import { afterEach, describe, expect, it, vi } from "vitest";

type IntlError = Parameters<NonNullable<RequestConfig["onError"]>>[0];
const missing = { code: "MISSING_MESSAGE", message: "x" } as unknown as IntlError;

const landingOnly = vi.hoisted(() => ({ value: false }));
const resolved = vi.hoisted(() => ({ locale: "en" }));

vi.mock("@/composition/app-stage/app-stage", () => ({
  isLandingOnly: vi.fn(() => Promise.resolve(landingOnly.value)),
}));
vi.mock("../request-locale/request-locale", () => ({
  getRequestLocale: vi.fn(() => Promise.resolve(resolved.locale)),
}));

import { createRequestConfig } from "./request-config";

const registry = [
  {
    namespace: "shared.buttons",
    surface: "shared" as const,
    messages: { en: { save: "Save" }, id: { save: "Simpan" } },
  },
];

afterEach(() => {
  vi.restoreAllMocks();
  landingOnly.value = false;
});

describe("createRequestConfig", () => {
  it("AC-L10N-003 throws on a missing message outside production", async () => {
    const config = await createRequestConfig(registry);
    expect(() => config.onError?.(missing)).toThrow();
  });

  it("AC-L10N-003 logs l10n.missing_message without user data in production", async () => {
    landingOnly.value = true;
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const config = await createRequestConfig(registry);
    expect(() => config.onError?.(missing)).not.toThrow();
    expect(error).toHaveBeenCalledWith(expect.stringContaining("l10n.missing_message"));
  });

  it("AC-L10N-003 the fallback is empty, never the key and never the other language", async () => {
    const config = await createRequestConfig(registry);
    expect(
      config.getMessageFallback?.({
        key: "shared.buttons.save",
        error: { code: "MISSING_MESSAGE", message: "x" },
      } as never),
    ).toBe("");
  });

  it("BR-L10N-002 passes the resolved locale, the Jakarta time zone and the registry messages", async () => {
    resolved.locale = "id";
    const config = await createRequestConfig(registry);
    expect(config.locale).toBe("id");
    expect(config.timeZone).toBe("Asia/Jakarta");
    expect(config.messages).toEqual({ "shared.buttons": { save: "Simpan" } });
    resolved.locale = "en";
  });
});
