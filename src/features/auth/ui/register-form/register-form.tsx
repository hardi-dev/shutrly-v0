"use client";

import { registerOwnerSchema } from "@/features/auth/application/use-cases/register-owner/register-owner.schema";
import { Button } from "@/ui/primitives/button/button";

import { AuthErrorAlert } from "../auth-error-alert/auth-error-alert";
import { ControlledTextField } from "../controlled-text-field/controlled-text-field";
import { useAuthForm } from "../use-auth-form/use-auth-form";
import { REGISTER_FORM_COPY as COPY } from "./register-form.copy";
import type { RegisterFormProps } from "./register-form.types";

const DEFAULTS = { name: "", email: "", password: "" };

/**
 * The Register form (auth.pen m3QGM; field errors hTP6i). The schema is the use case's own
 * (UX only; the server re-validates).
 * @param props - the register server action and the optional Google button
 * @returns the form
 */
export function RegisterForm({ action, secondaryAction }: Readonly<RegisterFormProps>) {
  const { form, server, onSubmit, isSubmitting } = useAuthForm({
    schema: registerOwnerSchema,
    defaultValues: DEFAULTS,
    action,
  });
  const { control } = form;
  return (
    <div className="flex flex-col gap-(--space-3)">
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-(--space-6)">
        {server.formError ? <AuthErrorAlert code={server.formError} /> : null}
        <div className="flex flex-col gap-(--space-4)">
          <ControlledTextField
            control={control}
            name="name"
            label={COPY.name}
            placeholder={COPY.namePlaceholder}
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" size="lg" isDisabled={isSubmitting}>
          {isSubmitting ? COPY.submitting : COPY.submit}
        </Button>
      </form>
      {secondaryAction}
    </div>
  );
}
