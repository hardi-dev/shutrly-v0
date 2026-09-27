import type { FieldErrorKey } from "@/features/auth/application/errors/auth-errors/auth-errors.types";

// Indonesian (CONFLICT-1). email.invalid and password.length are auth.pen hTP6i; the rest
// are // not in Pencil.
export const FIELD_ERROR_COPY: Record<FieldErrorKey, string> = {
  "name.required": "Masukkan nama Anda.", // not in Pencil
  "name.tooLong": "Gunakan paling banyak 100 karakter.", // not in Pencil
  "email.invalid": "Masukkan alamat email yang valid.",
  "password.required": "Masukkan kata sandi Anda.", // not in Pencil
  "password.length": "Gunakan 8–128 karakter.",
  "password.mismatch": "Kata sandi tidak cocok.", // not in Pencil
  "password.wrongCurrent": "Kata sandi saat ini salah.", // not in Pencil
};

// Password visibility labels are accessibility copy, not drawn in Pencil.
export const CONTROLLED_TEXT_FIELD_COPY = {
  showPassword: "Tampilkan kata sandi",
  hidePassword: "Sembunyikan kata sandi",
} as const;
