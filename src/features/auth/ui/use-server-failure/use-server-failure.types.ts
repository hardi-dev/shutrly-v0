import type { FieldValues, UseFormSetError } from "react-hook-form";

import type {
  AuthErrorCode,
  AuthFailure,
} from "@/features/auth/application/errors/auth-errors/auth-errors.types";

export interface ServerFailure<T extends FieldValues> {
  formError: AuthErrorCode | null;
  apply: (failure: AuthFailure, setError: UseFormSetError<T>) => void;
  clear: () => void;
}
