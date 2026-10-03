import { describe, expect, it } from "vitest";

import { clientFieldErrorText } from "./client-field-error";

describe("clientFieldErrorText", () => {
  it.each([
    ["EMPTY", "Isi nama klien."],
    ["TOO_LONG", "Nama klien maksimal 100 karakter."],
    ["INVALID", "Isian ini tidak valid."],
    ["INVALID_URL", "Tautan harus diawali https://"],
    ["DUPLICATE", "Akun ini sudah ada di daftar."],
    ["UNKNOWN_PLATFORM", "Pilih platform dari daftar."],
    ["TOO_MANY", "Maksimal 10 media sosial."],
  ] as const)("maps %s", (key, expected) => {
    expect(clientFieldErrorText(key)).toBe(expected);
  });

  it("names an active number holder", () => {
    expect(clientFieldErrorText("TAKEN", { name: "Rina", isArchived: false })).toBe(
      "Nomor ini sudah dipakai Rina",
    );
  });

  it("names an archived number holder", () => {
    expect(clientFieldErrorText("TAKEN", { name: "Budi", isArchived: true })).toBe(
      "Nomor ini sudah dipakai Budi (diarsipkan)",
    );
  });
});
