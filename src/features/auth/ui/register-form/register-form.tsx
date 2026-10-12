"use client";

import { useTranslations } from "next-intl";

import { registerOwnerSchema } from "@/features/auth/application/use-cases/register-owner/register-owner.schema";
import { Button } from "@/ui/primitives/button/button";

import { AuthErrorAlert } from "../auth-error-alert/auth-error-alert";
import { ControlledTextField } from "../controlled-text-field/controlled-text-field";
import { useAuthForm } from "../use-auth-form/use-auth-form";
import { REGISTER_FORM_COPY_NAMESPACE } from "./register-form.copy";
import type { RegisterFormProps } from "./register-form.types";

const DEFAULTS = { name: "", email: "", password: "" };

/**
 * The Register form (auth.pen m3QGM; field errors hTP6i). The schema is the use case's own
 * (UX only; the server re-validates).
 * @param props - the register server action and the optional Google button
 * @returns the form
 */
export function RegisterForm({ action, secondaryAction }: Readonly<RegisterFormProps>) {
  const t = useTranslations(REGISTER_FORM_COPY_NAMESPACE);
  const { form, server, onSubmit, isSubmitting, isReady } = useAuthForm({
    schema: registerOwnerSchema,
    defaultValues: DEFAULTS,
    action,
  });
  const { control } = form;
  return (
    <div className="flex flex-col gap-(--space-3)">
      <form method="post" noValidate onSubmit={onSubmit} className="flex flex-col gap-(--space-6)">
        {server.formError ? <AuthErrorAlert code={server.formError} /> : null}
        <div className="flex flex-col gap-(--space-4)">
          <ControlledTextField
            control={control}
            name="name"
            label={t("name")}
            placeholder={t("namePlaceholder")}
            autoComplete="name"
          />
          <ControlledTextField
            control={control}
            name="email"
            type="email"
            label={t("email")}
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
          />
          <ControlledTextField
            control={control}
            name="password"
            type="password"
            label={t("password")}
            placeholder={t("passwordPlaceholder")}
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" size="lg" isDisabled={!isReady || isSubmitting}>
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </form>
      {secondaryAction}
    </div>
  );
}
