"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { BaseSyntheticEvent } from "react";
import { useState } from "react";
import type { FieldValues } from "react-hook-form";
import { useForm } from "react-hook-form";

import { useServerFailure } from "../use-server-failure/use-server-failure";
import type { AuthForm, AuthFormOptions } from "./use-auth-form.types";

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error("Auth form submit failed");
}

/**
 * React Hook Form wired the same way for every auth form: the shared use-case schema through
 * `zodResolver` (UX only; the server re-validates, C-004), focus on the first invalid field,
 * and server failures routed by `useServerFailure`. An unexpected error is rethrown during
 * render so the route's error boundary shows the generic retry state (C-007).
 * @param options - the shared schema, default values, server action and optional success hook
 * @returns the form, the server-failure state, the submit handler and the submitting flag
 */
export function useAuthForm<T extends FieldValues>(options: AuthFormOptions<T>): AuthForm<T> {
  const { schema, defaultValues, action, onSuccess } = options;
  const [crash, setCrash] = useState<Error | null>(null);
  const form = useForm<T, unknown, T>({
    resolver: zodResolver(schema),
    defaultValues,
    shouldFocusError: true,
  });
  const server = useServerFailure<T>();
  if (crash) throw crash;

  async function submit(values: T): Promise<void> {
    server.clear();
    const failure = await action(values);
    if (failure) server.apply(failure, form.setError);
    else onSuccess?.();
  }

  function fail(error: unknown): void {
    setCrash(toError(error));
  }

  const handle = form.handleSubmit(submit);
  function onSubmit(event?: BaseSyntheticEvent): void {
    handle(event).catch(fail);
  }

  return { form, server, onSubmit, isSubmitting: form.formState.isSubmitting };
}
