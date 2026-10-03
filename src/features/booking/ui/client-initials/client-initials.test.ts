import { describe, expect, it } from "vitest";

import { clientInitials } from "./client-initials";

describe("clientInitials", () => {
  it.each([
    ["Bayu & Laras", "BL"],
    ["Ade Kurnia", "AK"],
    ["Keluarga Wijaya", "KW"],
    ["Budi", "BU"],
    ["Rina", "RI"],
    ["ade", "AD"],
  ])("returns %s as %s", (name, expected) => {
    expect(clientInitials(name)).toBe(expected);
  });
});
