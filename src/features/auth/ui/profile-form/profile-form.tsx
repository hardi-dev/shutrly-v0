"use client";

import { useState } from "react";

import { updateDisplayNameSchema } from "@/features/auth/application/use-cases/update-display-name/update-display-name.schema";
import { Alert } from "@/ui/patterns/alert/alert";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { AuthErrorAlert } from "../auth-error-alert/auth-error-alert";
import { ControlledTextField } from "../controlled-text-field/controlled-text-field";
import { useAuthForm } from "../use-auth-form/use-auth-form";
import { PROFILE_FORM_COPY as COPY } from "./profile-form.copy";
import type { ProfileFormProps } from "./profile-form.types";

// The email is shown, never submitted (AC-AUTH-020); the read-only field ignores edits.
function ignoreEdit(): void {
  // Read-only: there is nothing to update.
}

/**
 * The Profile form (auth.pen t7CXVK): read-only email and an editable display name.
 * @param props - the owner's email and name, and the update server action
 * @returns the form
 */
export function ProfileForm({ email, name, action }: Readonly<ProfileFormProps>) {
  const [saved, setSaved] = useState(false);
  function markSaved(): void {
    setSaved(true);
  }
  const { form, server, onSubmit, isSubmitting } = useAuthForm({
    schema: updateDisplayNameSchema,
    defaultValues: { name },
    action,
    onSuccess: markSaved,
  });
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-(--space-4)">
      {server.formError ? <AuthErrorAlert code={server.formError} /> : null}
      {saved && !isSubmitting ? <Alert tone="info" title={COPY.saved} live /> : null}
      <TextField
        label={COPY.email}
        name="email"
        type="email"
        value={email}
        isReadOnly
        onChange={ignoreEdit}
        onBlur={ignoreEdit}
      />
      <ControlledTextField
        control={form.control}
        name="name"
        label={COPY.name}
        autoComplete="name"
      />
      <div>
        <Button type="submit" isDisabled={isSubmitting}>
          {isSubmitting ? COPY.saving : COPY.save}
        </Button>
      </div>
    </form>
  );
}
