"use client";

import { requestPasswordResetSchema } from "@/features/auth/application/use-cases/request-password-reset/request-password-reset.schema";
import { Button } from "@/ui/primitives/button/button";

import { AuthErrorAlert } from "../auth-error-alert/auth-error-alert";
import { ControlledTextField } from "../controlled-text-field/controlled-text-field";
import { useAuthForm } from "../use-auth-form/use-auth-form";
import { FORGOT_PASSWORD_FORM_COPY as COPY } from "./forgot-password-form.copy";
import type { ForgotPasswordFormProps } from "./forgot-password-form.types";

/**
 * The Forgot password form (auth.pen o9WtCo). Every email gets the same next screen (A-5).
 * @param props - the forgot-password server action
 * @returns the form
 */
export function ForgotPasswordForm({ action }: Readonly<ForgotPasswordFormProps>) {
  const { form, server, onSubmit, isSubmitting } = useAuthForm({
    schema: requestPasswordResetSchema,
    defaultValues: { email: "" },
    action,
  });
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-(--space-6)">
      {server.formError ? <AuthErrorAlert code={server.formError} /> : null}
      <ControlledTextField
        control={form.control}
        name="email"
        type="email"
        label={COPY.email}
        placeholder={COPY.emailPlaceholder}
        autoComplete="email"
      />
      <Button type="submit" size="lg" isDisabled={isSubmitting}>
        {isSubmitting ? COPY.submitting : COPY.submit}
      </Button>
    </form>
  );
}
