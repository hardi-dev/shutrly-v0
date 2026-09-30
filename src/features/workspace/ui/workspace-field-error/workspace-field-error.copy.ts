import type { WorkspaceFieldErrorKey } from "@/features/workspace/application/schemas/workspace-fields/workspace-fields.types";

export const WORKSPACE_FIELD_ERROR_COPY: Record<WorkspaceFieldErrorKey, string> = {
  "name.required": "Nama workspace wajib diisi.", // not in Pencil
  "name.tooLong": "Nama workspace maksimal 60 karakter.", // not in Pencil
  "name.duplicate": "Kamu sudah punya workspace dengan nama ini.", // not in Pencil
  "brandName.tooLong": "Nama brand maksimal 80 karakter.", // not in Pencil
  "email.invalid": "Masukkan email yang valid, mis. halo@studio.id",
  "phone.invalid": "Masukkan 8–20 angka, spasi, +, -, atau tanda kurung.", // not in Pencil
  "address.tooLong": "Alamat maksimal 300 karakter.", // not in Pencil
  "prefix.invalid": "Prefiks harus 2–6 huruf atau angka.",
};
