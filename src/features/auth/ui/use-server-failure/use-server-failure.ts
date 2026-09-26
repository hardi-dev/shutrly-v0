"use client";

import { useCallback, useState } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import type {
  AuthErrorCode,
  AuthFailure,
} from "@/features/auth/application/errors/auth-errors/auth-errors.types";

import type { ServerFailure } from "./use-server-failure.types";

/**
 * Route a server-action failure: field errors go to their fields (the first one focused) with
 * `setError`; anything else becomes the form-level error (AC-AUTH-023).
 * @returns the current form error, and `apply` / `clear`
 */
export function useServerFailure<T extends FieldValues>(): ServerFailure<T> {
  const [formError, setFormError] = useState<AuthErrorCode | null>(null);

  const apply = useCallback((failure: AuthFailure, setError: UseFormSetError<T>) => {
    const entries = Object.entries(failure.fieldErrors ?? {});
    if (failure.code !== "VALIDATION_FAILED" || entries.length === 0) {
      setFormError(failure.code);
      return;
    }
    for (const [index, [field, key]] of entries.entries()) {
      const options = { shouldFocus: index === 0 };
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- server field names come from the form's own shared schema
      setError(field as Path<T>, { type: "server", message: key }, options);
    }
  }, []);

  const clear = useCallback(() => {
    setFormError(null);
  }, []);

  return { formError, apply, clear };
}
