"use client";

import { resetPasswordSchema } from "@/features/auth/application/use-cases/reset-password/reset-password.schema";
import { Button } from "@/ui/primitives/button/button";

import { AuthErrorAlert } from "../auth-error-alert/auth-error-alert";
import { ControlledTextField } from "../controlled-text-field/controlled-text-field";
import { useAuthForm } from "../use-auth-form/use-auth-form";
import { RESET_PASSWORD_FORM_COPY as COPY } from "./reset-password-form.copy";
import type { ResetPasswordFormProps } from "./reset-password-form.types";

/**
 * The Set new password form (auth.pen RFaNT); the link token travels as a form value.
 * @param props - the reset token and the reset server action
 * @returns the form
 */
export function ResetPasswordForm({ token, action }: Readonly<ResetPasswordFormProps>) {
  const { form, server, onSubmit, isSubmitting } = useAuthForm({
    schema: resetPasswordSchema,
    defaultValues: { token, password: "", confirm: "" },
    action,
  });
  const { control } = form;
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-(--space-6)">
      {server.formError ? <AuthErrorAlert code={server.formError} /> : null}
      <div className="flex flex-col gap-(--space-4)">
        <ControlledTextField
          control={control}
          name="password"
          type="password"
          label={COPY.password}
          placeholder={COPY.passwordPlaceholder}
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
      </div>
      <Button type="submit" size="lg" isDisabled={isSubmitting}>
        {isSubmitting ? COPY.submitting : COPY.submit}
      </Button>
    </form>
  );
}
