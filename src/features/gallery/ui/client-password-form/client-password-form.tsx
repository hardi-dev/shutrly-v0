"use client";

import { type BaseSyntheticEvent, useState } from "react";

import { Alert } from "@/ui/patterns/alert/alert";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { useClientPasswordForm } from "../use-client-password-form/use-client-password-form";
import type { ClientPasswordProblem } from "../use-client-password-form/use-client-password-form.types";
import { CLIENT_PASSWORD_FORM_COPY as COPY } from "./client-password-form.copy";
import type { ClientPasswordFormProps } from "./client-password-form.types";

function errorText(problem: ClientPasswordProblem | null): string | undefined {
  if (problem?.kind === "WRONG_PASSWORD") return COPY.wrongPassword;
  if (problem?.kind === "EMPTY") return COPY.empty;
  if (problem?.kind === "FAILED") return COPY.failed;
  return undefined;
}

/** The gallery password form (gerbang default A3bQ0, salah KpxQW, terkunci DNzk6). @param props - the sign-in action @returns the form */
export function ClientPasswordForm({ action }: Readonly<ClientPasswordFormProps>) {
  const { field, problem, submit, isSubmitting } = useClientPasswordForm(action);
  const [isVisible, setIsVisible] = useState(false);
  const isLocked = problem?.kind === "TOO_MANY_ATTEMPTS";
  const toggle = { label: isVisible ? COPY.hidePassword : COPY.showPassword, onPress: show };
  const eye = isVisible ? "eye-off" : "eye";
  function show(): void {
    setIsVisible((visible) => !visible);
  }
  function handleSubmit(event: BaseSyntheticEvent): void {
    void submit(event);
  }
  return (
    <form noValidate onSubmit={handleSubmit} className="flex w-full flex-col gap-(--space-6)">
      {isLocked ? (
        <Alert
          tone="warning"
          title={COPY.lockedTitle}
          body={COPY.lockedBody(problem.minutes)}
          live
        />
      ) : null}
      <TextField
        label={COPY.password}
        name={field.name}
        type={isVisible ? "text" : "password"}
        autoComplete="current-password"
        placeholder={COPY.placeholder}
        description={isLocked ? COPY.lockedHelper : COPY.helper}
        errorMessage={errorText(problem)}
        isDisabled={isLocked}
        iconTrailing={isLocked ? undefined : eye}
        iconTrailingAction={isLocked ? undefined : toggle}
        keepTrailingOnError
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        inputRef={field.ref}
      />
      <Button type="submit" size="lg" isDisabled={isLocked || isSubmitting}>
        {isSubmitting ? COPY.submitting : COPY.submit}
      </Button>
    </form>
  );
}
