import "server-only";

import type { AppLocale } from "@/shared/locale/locale.types";

// Auth email copy, verbatim from copy-deck §12 (D-17). Keyed by the locale the request resolved.
export const AUTH_EMAIL_COPY: Record<AppLocale, AuthEmailCopy> = {
  en: {
    greeting: "Hi",
    VERIFY_EMAIL: {
      subject: "Verify your Shutrly email",
      intro: "Confirm your email to finish signing up for Shutrly.",
      action: "Verify email",
      expiry: "This link is valid for 24 hours and can only be used once.",
      ignore: "If you didn’t create a Shutrly account, ignore this email.",
    },
    RESET_PASSWORD: {
      subject: "Reset your Shutrly password",
      intro: "Set a new password for your Shutrly account.",
      action: "Set new password",
      expiry: "This link is valid for one hour and can only be used once.",
      ignore: "If you didn’t request this, ignore this email. Your password hasn’t changed.",
    },
  },
  id: {
    greeting: "Halo",
    VERIFY_EMAIL: {
      subject: "Verifikasi email Shutrly kamu",
      intro: "Konfirmasi emailmu untuk menyelesaikan pendaftaran Shutrly.",
      action: "Verifikasi email",
      expiry: "Tautan ini berlaku 24 jam dan hanya bisa dipakai sekali.",
      ignore: "Kalau kamu tidak membuat akun Shutrly, abaikan email ini.",
    },
    RESET_PASSWORD: {
      subject: "Atur ulang kata sandi Shutrly kamu",
      intro: "Buat kata sandi baru untuk akun Shutrly kamu.",
      action: "Buat kata sandi baru",
      expiry: "Tautan ini berlaku satu jam dan hanya bisa dipakai sekali.",
      ignore: "Kalau kamu tidak memintanya, abaikan email ini. Kata sandimu tidak berubah.",
    },
  },
};

export interface AuthEmailCopy {
  greeting: string;
  VERIFY_EMAIL: AuthEmailKindCopy;
  RESET_PASSWORD: AuthEmailKindCopy;
}

export interface AuthEmailKindCopy {
  subject: string;
  intro: string;
  action: string;
  expiry: string;
  ignore: string;
}
