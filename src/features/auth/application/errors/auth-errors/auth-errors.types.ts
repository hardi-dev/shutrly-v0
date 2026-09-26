import type { z } from "zod";

import type { authErrorCodeSchema, fieldErrorKeySchema } from "./auth-errors.schema";

export type AuthErrorCode = z.infer<typeof authErrorCodeSchema>;

export type FieldErrorKey = z.infer<typeof fieldErrorKeySchema>;

export type FieldErrors = Partial<Record<string, FieldErrorKey>>;

export interface AuthFailure {
  ok: false;
  code: AuthErrorCode;
  fieldErrors?: FieldErrors;
}

export interface AuthSuccess {
  ok: true;
}

export type AuthResult<T extends object = object> = (AuthSuccess & T) | AuthFailure;
