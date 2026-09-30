import type { WorkspaceFieldErrorKey } from "@/features/workspace/application/schemas/workspace-fields/workspace-fields.types";

export const SETTINGS_COPY = {
  brandTitle: "Identitas brand",
  brandDescription: "Nama dan brand yang dilihat klien di galeri dan invoice.",
  contactTitle: "Kontak",
  contactDescription: "Ditampilkan di invoice agar klien bisa menghubungimu.",
  invoiceTitle: "Invoice",
  invoiceDescription: "Format nomor invoice untuk workspace ini.",
  name: "Nama workspace",
  brandName: "Nama brand",
  brandNameHelper: "Kosongkan untuk memakai nama workspace.",
  email: "Email kontak",
  phone: "Telepon",
  address: "Alamat",
  prefix: "Prefiks invoice",
  prefixHelper: "2–6 huruf atau angka. Hanya berlaku untuk invoice baru.",
  currency: "Mata uang",
  currencyValue: "IDR — Rupiah Indonesia",
  currencyHelper: "Saat ini hanya IDR yang didukung.",
  save: "Simpan perubahan",
  saving: "Menyimpan…", // not in Pencil
  saved: "Perubahan tersimpan",
  savedBody: "Nama di sidebar dan branding untuk klien sudah diperbarui.",
  serverErrorTitle: "Perubahan belum tersimpan",
  serverErrorBody: "Terjadi kendala di server. Isianmu tetap ada — coba simpan lagi.",
} as const;

export const SETTINGS_FIELD_ERROR_COPY: Record<WorkspaceFieldErrorKey, string> = {
  "name.required": "Nama workspace wajib diisi.", // not in Pencil
  "name.tooLong": "Nama workspace maksimal 60 karakter.", // not in Pencil
  "name.duplicate": "Kamu sudah punya workspace dengan nama ini.", // not in Pencil
  "brandName.tooLong": "Nama brand maksimal 80 karakter.", // not in Pencil
  "email.invalid": "Masukkan email yang valid, mis. halo@studio.id",
  "phone.invalid": "Masukkan 8–20 angka, spasi, +, -, atau tanda kurung.", // not in Pencil
  "address.tooLong": "Alamat maksimal 300 karakter.", // not in Pencil
  "prefix.invalid": "Prefiks harus 2–6 huruf atau angka.",
};
