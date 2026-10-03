const PATH_MESSAGES: Readonly<Partial<Record<string, Readonly<Partial<Record<string, string>>>>>> =
  {
    clientId: {
      REQUIRED: "Pilih klien.",
      CLIENT_INACTIVE: "Klien ini sudah diarsipkan. Pilih klien lain.",
    },
    serviceId: {
      REQUIRED: "Pilih layanan.",
      SERVICE_INACTIVE: "Layanan ini sudah tidak aktif. Pilih layanan lain.",
    },
    title: { EMPTY: "Isi judul proyek.", TOO_LONG: "Judul proyek maksimal 100 karakter." },
    notes: { TOO_LONG: "Catatan maksimal 2000 karakter." },
    agreedPrice: {
      EMPTY: "Isi harga sepakat.",
      NEGATIVE: "Harga tidak boleh negatif.",
      NOT_WHOLE: "Harga dalam rupiah bulat, tanpa koma.",
      TOO_LARGE: "Harga maksimal Rp 999.999.999.999.",
    },
    sessions: { SESSION_REQUIRED: "Tambahkan minimal satu sesi." },
    name: { EMPTY: "Isi nama sesi.", TOO_LONG: "Nama sesi maksimal 100 karakter." },
    date: { EMPTY: "Pilih tanggal sesi.", INVALID: "Pilih tanggal yang valid." },
    endTime: {
      END_WITHOUT_START: "Isi jam mulai dulu.",
      END_NOT_AFTER_START: "Jam selesai harus setelah jam mulai.",
    },
    location: { TOO_LONG: "Lokasi maksimal 200 karakter." },
  };
const GENERIC_INVALID = "Masukkan angka yang valid.";

function fieldValueMessage(key: string, fieldName: string): string {
  if (key === "REQUIRED") return `Isi ${fieldName}.`;
  if (key === "TOO_LONG") return `${fieldName} maksimal 200 karakter.`;
  if (key === "NOT_AN_OPTION") return "Pilih salah satu opsi.";
  return "Masukkan nilai yang valid.";
}

/** Maps a project validation key to Indonesian field feedback. @param path - the field path, e.g. "title" or "fieldValues.nama_kampus" @param key - stable validation key @param fieldName - the booking field's display name for fieldValues paths @returns the message to show under the field */
export function projectFieldErrorText(path: string, key: string, fieldName = ""): string {
  if (path.startsWith("fieldValues.")) return fieldValueMessage(key, fieldName);
  const leaf = path.split(".").at(-1) ?? path;
  return PATH_MESSAGES[leaf]?.[key] ?? GENERIC_INVALID;
}
