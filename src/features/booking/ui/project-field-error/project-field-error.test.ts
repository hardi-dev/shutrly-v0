import { describe, expect, it } from "vitest";

import { projectFieldErrorText } from "./project-field-error";

describe("project field error copy", () => {
  it("AC-PRJ-010 maps each validation key to its Indonesian message", () => {
    expect(projectFieldErrorText("title", "EMPTY")).toBe("Isi judul proyek.");
    expect(projectFieldErrorText("clientId", "REQUIRED")).toBe("Pilih klien.");
    expect(projectFieldErrorText("serviceId", "SERVICE_INACTIVE")).toBe(
      "Layanan ini sudah tidak aktif. Pilih layanan lain.",
    );
    expect(projectFieldErrorText("sessions", "SESSION_REQUIRED")).toBe(
      "Tambahkan minimal satu sesi.",
    );
    expect(projectFieldErrorText("agreedPrice", "NOT_WHOLE")).toBe(
      "Harga dalam rupiah bulat, tanpa koma.",
    );
  });

  it("AC-PRJ-010 names the booking field in its required message", () => {
    expect(projectFieldErrorText("fieldValues.nama_kampus", "REQUIRED", "Nama kampus")).toBe(
      "Isi Nama kampus.",
    );
    expect(projectFieldErrorText("fieldValues.ukuran_toga", "NOT_AN_OPTION", "Ukuran toga")).toBe(
      "Pilih salah satu opsi.",
    );
  });

  it("AC-PRJ-029 resolves session paths by their last segment", () => {
    expect(projectFieldErrorText("sessions.0.endTime", "END_NOT_AFTER_START")).toBe(
      "Jam selesai harus setelah jam mulai.",
    );
    expect(projectFieldErrorText("endTime", "END_WITHOUT_START")).toBe("Isi jam mulai dulu.");
  });

  it("falls back to a generic message for an unknown key", () => {
    expect(projectFieldErrorText("agreedPrice", "WHATEVER")).toBe("Masukkan angka yang valid.");
  });
});
