import { describe, expect, it } from "vitest";

import { addSourceSchema } from "./add-source/add-source.schema";
import { sourceNameSchema } from "./source-name/source-name.schema";

describe("source schemas", () => {
  it("AC-SRC-007 rejects unavailable providers", () => {
    const result = addSourceSchema.safeParse({ provider: "DROPBOX", displayName: "Arsip" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("PROVIDER_UNAVAILABLE");
  });

  it.each([
    ["", "EMPTY"],
    ["a".repeat(61), "TOO_LONG"],
  ])("AC-SRC-008 rejects %j", (displayName, message) => {
    const result = sourceNameSchema.safeParse({ displayName });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe(message);
  });
});
