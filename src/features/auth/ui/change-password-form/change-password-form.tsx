"use client";

import { useState } from "react";
import type { Control } from "react-hook-form";

import { changePasswordSchema } from "@/features/auth/application/use-cases/change-password/change-password.schema";
import type { ChangePasswordInput } from "@/features/auth/application/use-cases/change-password/change-password.types";
import { Alert } from "@/ui/patterns/alert/alert";
import { Button } from "@/ui/primitives/button/button";

import { AuthErrorAlert } from "../auth-error-alert/auth-error-alert";
import { ControlledTextField } from "../controlled-text-field/controlled-text-field";
import { useAuthForm } from "../use-auth-form/use-auth-form";
import { CHANGE_PASSWORD_FORM_COPY as COPY } from "./change-password-form.copy";
import type { ChangePasswordFormProps } from "./change-password-form.types";

const DEFAULTS = { currentPassword: "", newPassword: "", confirm: "" };

function PasswordFields({ control }: Readonly<{ control: Control<ChangePasswordInput> }>) {
  return (
    <>
      <ControlledTextField
        control={control}
        name="currentPassword"
        type="password"
        label={COPY.current}
        placeholder={COPY.currentPlaceholder}
        autoComplete="current-password"
      />
      <ControlledTextField
        control={control}
        name="newPassword"
        type="password"
        label={COPY.next}
        placeholder={COPY.nextPlaceholder}
        autoComplete="new-password"
      />
      <ControlledTextField
        control={control}
        name="confirm"
        type="password"
        label={COPY.confirm}
        placeholder={COPY.confirmPlaceholder}
        autoComplete="new-password"
      />
    </>
  );
}

/**
 * The Change password form (auth.pen t7CXVK); other sessions are signed out (A-4).
 * @param props - the change-password server action
 * @returns the form
 */
export function ChangePasswordForm({
  action,
  initialDone = false,
}: Readonly<ChangePasswordFormProps>) {
  const [done, setDone] = useState(initialDone);
  function afterChange(): void {
    setDone(true);
    form.reset();
  }
  const { form, server, onSubmit, isSubmitting } = useAuthForm({
    schema: changePasswordSchema,
    defaultValues: DEFAULTS,
    action,
    onSuccess: afterChange,
  });
  const { control } = form;
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-(--space-4)">
      {server.formError ? <AuthErrorAlert code={server.formError} /> : null}
      {done && !isSubmitting ? <Alert tone="info" title={COPY.done} live /> : null}
      <PasswordFields control={control} />
      <div>
        <Button type="submit" isDisabled={isSubmitting}>
          {isSubmitting ? COPY.submitting : COPY.submit}
        </Button>
      </div>
    </form>
  );
}
