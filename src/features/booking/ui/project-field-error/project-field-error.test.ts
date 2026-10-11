import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import { PROJECT_COPY_NAMESPACE } from "../project-copy/project-copy.copy";
import { projectFieldErrorText } from "./project-field-error";

const t = copyTranslator(PROJECT_COPY_NAMESPACE, "id");
const tEn = copyTranslator(PROJECT_COPY_NAMESPACE, "en");

describe("project field error copy", () => {
  it("AC-PRJ-010 maps each validation key to its Indonesian message", () => {
    expect(projectFieldErrorText(t, "title", "EMPTY")).toBe("Isi judul proyek.");
    expect(projectFieldErrorText(t, "clientId", "REQUIRED")).toBe("Pilih klien.");
    expect(projectFieldErrorText(t, "serviceId", "SERVICE_INACTIVE")).toBe(
      "Layanan ini sudah tidak aktif. Pilih layanan lain.",
    );
    expect(projectFieldErrorText(t, "sessions", "SESSION_REQUIRED")).toBe(
      "Tambahkan minimal satu sesi.",
    );
    expect(projectFieldErrorText(t, "agreedPrice", "NOT_WHOLE")).toBe(
      "Isi harga dalam rupiah bulat, tanpa desimal.",
    );
  });

  it("AC-PRJ-010 names the booking field in its required message", () => {
    expect(projectFieldErrorText(t, "fieldValues.nama_kampus", "REQUIRED", "Nama kampus")).toBe(
      "Isi Nama kampus.",
    );
    expect(
      projectFieldErrorText(t, "fieldValues.ukuran_toga", "NOT_AN_OPTION", "Ukuran toga"),
    ).toBe("Pilih salah satu pilihan yang tersedia.");
  });

  it("AC-PRJ-010 formats the price cap for the active locale", () => {
    expect(projectFieldErrorText(t, "agreedPrice", "TOO_LARGE")).toBe(
      "Harga maksimal Rp 999.999.999.999.",
    );
    expect(projectFieldErrorText(tEn, "agreedPrice", "TOO_LARGE")).toBe(
      "The maximum price is IDR 999,999,999,999.",
    );
  });

  it("AC-PRJ-029 resolves session paths by their last segment", () => {
    expect(projectFieldErrorText(t, "sessions.0.endTime", "END_NOT_AFTER_START")).toBe(
      "Jam selesai harus setelah jam mulai.",
    );
    expect(projectFieldErrorText(t, "endTime", "END_WITHOUT_START")).toBe("Isi jam mulai dulu.");
  });

  it("falls back to the generic field message for an unknown key", () => {
    expect(projectFieldErrorText(t, "agreedPrice", "WHATEVER")).toBe(
      "Cek isian ini, lalu coba lagi.",
    );
    expect(projectFieldErrorText(t, "fieldValues.nama_kampus", "WHATEVER", "Nama kampus")).toBe(
      "Masukkan nilai yang valid.",
    );
  });
});
