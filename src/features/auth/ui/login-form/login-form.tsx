"use client";

import { loginOwnerSchema } from "@/features/auth/application/use-cases/login-owner/login-owner.schema";
import { Button } from "@/ui/primitives/button/button";

import { AuthErrorAlert } from "../auth-error-alert/auth-error-alert";
import { AuthTextLink } from "../auth-text-link/auth-text-link";
import { ControlledTextField } from "../controlled-text-field/controlled-text-field";
import { useAuthForm } from "../use-auth-form/use-auth-form";
import { LOGIN_FORM_COPY as COPY } from "./login-form.copy";
import type { LoginFormProps } from "./login-form.types";

const DEFAULTS = { email: "", password: "" };

/**
 * The Login form (auth.pen amp4Y; invalid credentials q8b0R9; processing U9laqq; focus u9HFU).
 * @param props - the login server action, an initial Google error and the Google button
 * @returns the form
 */
export function LoginForm({
  action,
  initialError = null,
  secondaryAction,
}: Readonly<LoginFormProps>) {
  const { form, server, onSubmit, isSubmitting } = useAuthForm({
    schema: loginOwnerSchema,
    defaultValues: DEFAULTS,
    action,
  });
  const shownError = server.formError ?? (form.formState.isSubmitted ? null : initialError);
  const { control } = form;
  return (
    <div className="flex flex-col gap-(--space-3)">
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-(--space-6)">
        {shownError ? <AuthErrorAlert code={shownError} /> : null}
        <div className="flex flex-col gap-(--space-4)">
          <ControlledTextField
            control={control}
            name="email"
            type="email"
            label={COPY.email}
            placeholder={COPY.emailPlaceholder}
            autoComplete="email"
          />
          <ControlledTextField
            control={control}
            name="password"
            type="password"
            label={COPY.password}
            placeholder={COPY.passwordPlaceholder}
            autoComplete="current-password"
          />
          <div className="flex justify-end">
            <AuthTextLink href="/forgot-password">{COPY.forgot}</AuthTextLink>
          </div>
        </div>
        <Button type="submit" size="lg" isDisabled={isSubmitting}>
          {isSubmitting ? COPY.submitting : COPY.submit}
        </Button>
      </form>
      {secondaryAction}
    </div>
  );
}
