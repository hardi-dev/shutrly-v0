import { describe, expect, it } from "vitest";

import { APP_LOCALES, DEFAULT_LOCALE, formattingLocale, parseAppLocale } from "./locale";

describe("app locale", () => {
  it("BR-L10N-001 parses en and id", () => {
    expect(parseAppLocale("en")).toBe("en");
    expect(parseAppLocale("id")).toBe("id");
  });

  it("BR-L10N-001 rejects tampered, empty, upper-case and unknown values", () => {
    expect(parseAppLocale("EN")).toBeNull();
    expect(parseAppLocale("")).toBeNull();
    expect(parseAppLocale("fr")).toBeNull();
    expect(parseAppLocale("en-US")).toBeNull();
    expect(parseAppLocale(undefined)).toBeNull();
  });

  it("AC-L10N-005 maps en to en-US and id to id-ID", () => {
    expect(formattingLocale("en")).toBe("en-US");
    expect(formattingLocale("id")).toBe("id-ID");
  });

  it("BR-L10N-001 defaults to en and lists both supported locales", () => {
    expect(DEFAULT_LOCALE).toBe("en");
    expect(APP_LOCALES).toEqual(["en", "id"]);
  });
});
