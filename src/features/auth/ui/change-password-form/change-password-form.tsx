"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Control } from "react-hook-form";

import { changePasswordSchema } from "@/features/auth/application/use-cases/change-password/change-password.schema";
import type { ChangePasswordInput } from "@/features/auth/application/use-cases/change-password/change-password.types";
import { Alert } from "@/ui/patterns/alert/alert";
import { Button } from "@/ui/primitives/button/button";

import { AuthErrorAlert } from "../auth-error-alert/auth-error-alert";
import { ControlledTextField } from "../controlled-text-field/controlled-text-field";
import { useAuthForm } from "../use-auth-form/use-auth-form";
import { CHANGE_PASSWORD_FORM_COPY_NAMESPACE } from "./change-password-form.copy";
import type { ChangePasswordFormProps } from "./change-password-form.types";

const DEFAULTS = { currentPassword: "", newPassword: "", confirm: "" };

function PasswordFields({ control }: Readonly<{ control: Control<ChangePasswordInput> }>) {
  const t = useTranslations(CHANGE_PASSWORD_FORM_COPY_NAMESPACE);
  return (
    <>
      <ControlledTextField
        control={control}
        name="currentPassword"
        type="password"
        label={t("current")}
        placeholder={t("currentPlaceholder")}
        autoComplete="current-password"
      />
      <ControlledTextField
        control={control}
        name="newPassword"
        type="password"
        label={t("next")}
        placeholder={t("nextPlaceholder")}
        autoComplete="new-password"
      />
      <ControlledTextField
        control={control}
        name="confirm"
        type="password"
        label={t("confirm")}
        placeholder={t("confirmPlaceholder")}
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
  const t = useTranslations(CHANGE_PASSWORD_FORM_COPY_NAMESPACE);
  const [done, setDone] = useState(initialDone);
  function afterChange(): void {
    setDone(true);
    form.reset();
  }
  const { form, server, onSubmit, isSubmitting, isReady } = useAuthForm({
    schema: changePasswordSchema,
    defaultValues: DEFAULTS,
    action,
    onSuccess: afterChange,
  });
  const { control } = form;
  return (
    <form method="post" noValidate onSubmit={onSubmit} className="flex flex-col gap-(--space-4)">
      {server.formError ? <AuthErrorAlert code={server.formError} /> : null}
      {done && !isSubmitting ? <Alert tone="info" title={t("done")} live /> : null}
      <PasswordFields control={control} />
      <div>
        <Button type="submit" isDisabled={!isReady || isSubmitting}>
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
