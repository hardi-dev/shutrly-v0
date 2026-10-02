import type { NumberHolder } from "@/features/booking/application/ports/client-repository/client-repository.port";
import type { ClientFieldErrorKey } from "@/features/booking/application/use-cases/client-results/client-results.types";

/** Maps client validation keys to Indonesian field feedback. @param key - stable validation key @param holder - optional client using a duplicate number @returns field feedback */
export function clientFieldErrorText(key: ClientFieldErrorKey, holder?: NumberHolder): string {
  if (key === "TAKEN" && holder)
    return `Nomor ini sudah dipakai ${holder.name}${holder.isArchived ? " (diarsipkan)" : ""}`;
  return {
    EMPTY: "Isi nama klien.",
    TOO_LONG: "Nama klien maksimal 100 karakter.",
    INVALID: "Isian ini tidak valid.",
    TAKEN: "Nomor ini sudah dipakai",
    INVALID_URL: "Tautan harus diawali https://",
    DUPLICATE: "Akun ini sudah ada di daftar.",
    UNKNOWN_PLATFORM: "Pilih platform dari daftar.",
    TOO_MANY: "Maksimal 10 media sosial.",
  }[key];
}
