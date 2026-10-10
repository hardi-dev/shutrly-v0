// Source: copy-deck.md §2.7 (field errors and password visibility labels). The message keys are camel-case because next-intl reads dots as nesting; FIELD_ERROR_MESSAGE_KEY maps the stable FieldErrorKey values to them.
import type { FieldErrorKey } from "@/features/auth/application/errors/auth-errors/auth-errors.types";

export const CONTROLLED_TEXT_FIELD_COPY_NAMESPACE = "authField";

export const CONTROLLED_TEXT_FIELD_COPY = {
  namespace: CONTROLLED_TEXT_FIELD_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      showPassword: "Show password",
      hidePassword: "Hide password",
      nameRequired: "Enter your name.",
      nameTooLong: "Use no more than 100 characters.",
      emailInvalid: "Enter a valid email address.",
      passwordRequired: "Enter your password.",
      passwordLength: "Use 8–128 characters.",
      passwordMismatch: "The passwords don’t match. Enter them again.",
      passwordWrongCurrent: "Your current password is incorrect.",
    },
    id: {
      showPassword: "Tampilkan kata sandi",
      hidePassword: "Sembunyikan kata sandi",
      nameRequired: "Isi namamu.",
      nameTooLong: "Gunakan maksimal 100 karakter.",
      emailInvalid: "Masukkan alamat email yang valid.",
      passwordRequired: "Masukkan kata sandimu.",
      passwordLength: "Gunakan 8–128 karakter.",
      passwordMismatch: "Kata sandinya belum cocok. Masukkan lagi.",
      passwordWrongCurrent: "Kata sandi saat ini salah.",
    },
  },
} as const;

/** The stable FieldErrorKey values mapped to their message keys (next-intl reads dots as nesting). */
export const FIELD_ERROR_MESSAGE_KEY = {
  "name.required": "nameRequired",
  "name.tooLong": "nameTooLong",
  "email.invalid": "emailInvalid",
  "password.required": "passwordRequired",
  "password.length": "passwordLength",
  "password.mismatch": "passwordMismatch",
  "password.wrongCurrent": "passwordWrongCurrent",
} as const satisfies Record<FieldErrorKey, string>;
