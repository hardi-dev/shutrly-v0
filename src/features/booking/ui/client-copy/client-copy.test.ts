import { describe, expect, it } from "vitest";

import { CLIENT_COPY } from "./client-copy.copy";

describe("CLIENT_COPY", () => {
  it.each([
    ["ACTIVE", 38, "38 klien aktif"],
    ["ARCHIVED", 1, "1 klien diarsipkan"],
    ["ACTIVE", 0, "0 klien aktif"],
  ] as const)("formats the %s count", (status, count, expected) => {
    expect(CLIENT_COPY.count(status, count)).toBe(expected);
  });
});
