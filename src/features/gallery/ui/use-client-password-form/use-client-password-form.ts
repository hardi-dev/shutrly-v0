"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useController, useForm } from "react-hook-form";

import { clientSignInSchema } from "@/features/gallery/application/schemas/client-sign-in/client-sign-in.schema";
import type {
  ClientSignInInput,
  ClientSignInValues,
} from "@/features/gallery/application/schemas/client-sign-in/client-sign-in.types";

import type { ClientPasswordFormProps } from "../client-password-form/client-password-form.types";
import type { ClientPasswordProblem } from "./use-client-password-form.types";

/** Owns the gallery password form: validation, the action call and its outcome (D-5, AC-ACC-001…003). @param action - the sign-in server action @returns the field, the problem to show and the submit handler */
export function useClientPasswordForm(action: ClientPasswordFormProps["action"]) {
  const router = useRouter();
  const [problem, setProblem] = useState<ClientPasswordProblem | null>(null);
  const form = useForm<ClientSignInInput, unknown, ClientSignInValues>({
    resolver: zodResolver(clientSignInSchema),
    defaultValues: { password: "" },
  });
  const password = useController({ control: form.control, name: "password" });
  const submit = form.handleSubmit(async (values) => {
    setProblem(null);
    try {
      const result = await action(values);
      if (result.kind === "NEUTRAL") router.refresh();
      else if (result.kind === "INVALID") setProblem({ kind: "EMPTY" });
      else setProblem(result);
    } catch (error) {
      // A successful sign-in redirects by throwing; let Next handle it.
      if (isRedirect(error)) throw error;
      setProblem({ kind: "FAILED" });
    }
  });
  const fieldProblem = password.fieldState.error ? { kind: "EMPTY" as const } : problem;
  return {
    field: password.field,
    problem: fieldProblem,
    submit,
    isSubmitting: form.formState.isSubmitting,
  };
}

function isRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  );
}
