"use client";

import { useTranslations } from "next-intl";
import { type BaseSyntheticEvent, useState } from "react";

import { useHydrated } from "@/ui/hooks/use-hydrated/use-hydrated";
import { Alert } from "@/ui/patterns/alert/alert";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { useClientPasswordForm } from "../use-client-password-form/use-client-password-form";
import type { ClientPasswordProblem } from "../use-client-password-form/use-client-password-form.types";
import { CLIENT_PASSWORD_FORM_COPY_NAMESPACE } from "./client-password-form.copy";
import type { ClientPasswordFormProps, PasswordTranslate } from "./client-password-form.types";

function errorText(
  t: PasswordTranslate,
  problem: ClientPasswordProblem | null,
): string | undefined {
  if (problem?.kind === "WRONG_PASSWORD") return t("wrongPassword");
  if (problem?.kind === "EMPTY") return t("empty");
  if (problem?.kind === "FAILED") return t("failed");
  return undefined;
}

/** The gallery password form (gerbang default A3bQ0, salah KpxQW, terkunci DNzk6). @param props - the sign-in action @returns the form */
export function ClientPasswordForm({ action }: Readonly<ClientPasswordFormProps>) {
  const t = useTranslations(CLIENT_PASSWORD_FORM_COPY_NAMESPACE);
  const { field, problem, submit, isSubmitting } = useClientPasswordForm(action);
  const [isVisible, setIsVisible] = useState(false);
  const hydrated = useHydrated();
  const isLocked = problem?.kind === "TOO_MANY_ATTEMPTS";
  const toggle = { label: isVisible ? t("hidePassword") : t("showPassword"), onPress: show };
  const eye = isVisible ? "eye-off" : "eye";
  function show(): void {
    setIsVisible((visible) => !visible);
  }
  const handleSubmit = (event: BaseSyntheticEvent): void => void submit(event);
  return (
    <form
      method="post"
      noValidate
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-(--space-6)"
    >
      {isLocked ? (
        <Alert
          tone="warning"
          title={t("lockedTitle")}
          body={t("lockedBody", { minutes: problem.minutes })}
          live
        />
      ) : null}
      <TextField
        label={t("password")}
        name={field.name}
        type={isVisible ? "text" : "password"}
        autoComplete="current-password"
        placeholder={t("placeholder")}
        description={isLocked ? t("lockedHelper") : t("helper")}
        errorMessage={errorText(t, problem)}
        isDisabled={isLocked}
        iconTrailing={isLocked ? undefined : eye}
        iconTrailingAction={isLocked ? undefined : toggle}
        keepTrailingOnError
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        inputRef={field.ref}
      />
      <Button type="submit" size="lg" isDisabled={!hydrated || isLocked || isSubmitting}>
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
