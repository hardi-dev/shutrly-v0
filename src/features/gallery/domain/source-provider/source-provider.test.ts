import { describe, expect, it } from "vitest";

import {
  AVAILABLE_SOURCE_PROVIDERS,
  emptyProviderConfig,
  isAvailableSourceProvider,
  SOURCE_PROVIDERS,
} from "./source-provider";

describe("source providers (BR-SRC-001, BR-SRC-005)", () => {
  it("AC-SRC-007 lists Google Drive first and only it as available", () => {
    expect(SOURCE_PROVIDERS).toEqual([
      "GOOGLE_DRIVE",
      "DROPBOX",
      "ONEDRIVE",
      "AMAZON_S3",
      "CUSTOM_URL",
    ]);
    expect(AVAILABLE_SOURCE_PROVIDERS).toEqual(["GOOGLE_DRIVE"]);
    expect(isAvailableSourceProvider("DROPBOX")).toBe(false);
  });

  it("AC-SRC-016 BR-SRC-003 the Google Drive config is empty", () => {
    expect(emptyProviderConfig("GOOGLE_DRIVE")).toEqual({});
  });
});
