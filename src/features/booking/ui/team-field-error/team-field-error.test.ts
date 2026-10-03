import { describe, expect, it } from "vitest";

import { teamRoleErrorText } from "./team-field-error";

describe("teamRoleErrorText", () => {
  it.each([
    ["EMPTY", "Isi nama peran."],
    ["TOO_LONG", "Nama peran paling banyak 50 karakter."],
    ["DUPLICATE", "Peran ini sudah ada."],
  ])("AC-TEAM-009 maps %s", (key, text) => {
    expect(teamRoleErrorText(key)).toBe(text);
  });
});
