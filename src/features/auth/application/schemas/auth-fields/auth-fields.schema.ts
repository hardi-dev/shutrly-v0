import { z } from "zod";

import {
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/features/auth/domain/credentials/credentials";

// Field schemas shared by the auth use-case schemas. Messages are FieldErrorKey values.
export const emailFieldSchema = z.string().trim().pipe(z.email("email.invalid"));

export const newPasswordFieldSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, "password.length")
  .max(PASSWORD_MAX_LENGTH, "password.length");

// Login and change-password: any non-empty value; a wrong-length password is simply wrong (A-5).
export const currentPasswordFieldSchema = z.string().min(1, "password.required");

export const displayNameFieldSchema = z
  .string()
  .trim()
  .min(1, "name.required")
  .max(DISPLAY_NAME_MAX_LENGTH, "name.tooLong");
