import { describe, expect, it } from "vitest";

import { teamMemberErrorText, teamRoleErrorText } from "./team-field-error";

describe("teamRoleErrorText", () => {
  it.each([
    ["EMPTY", "Isi nama peran."],
    ["TOO_LONG", "Nama peran paling banyak 50 karakter."],
    ["DUPLICATE", "Peran ini sudah ada."],
  ])("AC-TEAM-009 maps %s", (key, text) => {
    expect(teamRoleErrorText(key)).toBe(text);
  });
});

describe("teamMemberErrorText", () => {
  it.each([
    ["name", "EMPTY", "Isi nama anggota."],
    ["name", "TOO_LONG", "Nama paling banyak 100 karakter."],
    ["whatsappNumber", "REQUIRED", "Nomor WhatsApp wajib diisi"],
    ["whatsappNumber", "INVALID", "Nomor WhatsApp tidak valid"],
    ["email", "INVALID", "Masukkan email yang valid."],
    ["roleIds", "REQUIRED", "Pilih minimal satu peran."],
  ] as const)("AC-TEAM-005 maps %s %s", (field, key, text) => {
    expect(teamMemberErrorText(field, key)).toBe(text);
  });

  it("AC-TEAM-006 names the holder and marks an archived one", () => {
    expect(
      teamMemberErrorText("whatsappNumber", "TAKEN", { name: "Dimas", isArchived: false }),
    ).toBe("Nomor ini sudah dipakai Dimas.");
    expect(
      teamMemberErrorText("whatsappNumber", "TAKEN", { name: "Budi Hartono", isArchived: true }),
    ).toBe("Nomor ini sudah dipakai Budi Hartono (diarsipkan).");
  });
});
