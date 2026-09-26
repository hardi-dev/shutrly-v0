import type { BaseSyntheticEvent } from "react";
import type { DefaultValues, FieldValues, UseFormReturn } from "react-hook-form";
import type { z } from "zod";

import type { AuthFailure } from "@/features/auth/application/errors/auth-errors/auth-errors.types";

import type { ServerFailure } from "../use-server-failure/use-server-failure.types";

/** A server action behind a form: nothing on success (it redirects or the form resets). */
export type FormAction<T> = (values: T) => Promise<AuthFailure | undefined>;

export interface AuthFormOptions<T extends FieldValues> {
  schema: z.ZodType<T, T>;
  defaultValues: DefaultValues<T>;
  action: FormAction<T>;
  onSuccess?: () => void;
}

export interface AuthForm<T extends FieldValues> {
  form: UseFormReturn<T, unknown, T>;
  server: ServerFailure<T>;
  onSubmit: (event?: BaseSyntheticEvent) => void;
  isSubmitting: boolean;
}
