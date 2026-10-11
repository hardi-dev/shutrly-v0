import { beforeEach, describe, expect, it, vi } from "vitest";

const updateOwnerLocale = vi.fn();

vi.mock("@/composition/locale/locale-flow/locale-flow", () => ({ updateOwnerLocale }));

const { setOwnerLocaleAction } = await import("./profile");

describe("setOwnerLocaleAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("BR-L10N-001 the profile action returns no error after a valid change", async () => {
    updateOwnerLocale.mockResolvedValue({ ok: true });
    expect(await setOwnerLocaleAction({ locale: "id" })).toBeUndefined();
    expect(updateOwnerLocale).toHaveBeenCalledWith({ locale: "id" });
  });

  it("BR-L10N-001 returns the failure when the locale is refused", async () => {
    const failure = { ok: false, code: "VALIDATION_FAILED", fieldErrors: {} };
    updateOwnerLocale.mockResolvedValue(failure);
    expect(await setOwnerLocaleAction({ locale: "id" })).toEqual(failure);
  });
});
