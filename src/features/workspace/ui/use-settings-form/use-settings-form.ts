"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { BaseSyntheticEvent } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { updateWorkspaceProfileFieldsSchema } from "@/features/workspace/application/schemas/workspace-fields/workspace-fields.schema";

import type { SettingsProfile, SettingsValues } from "../settings-screen/settings-screen.types";
import type { SettingsForm, SettingsFormOptions } from "./use-settings-form.types";

const FIELDS = ["name", "brandName", "contactEmail", "phone", "address", "invoicePrefix"] as const;

function toValues(profile: SettingsProfile): SettingsValues {
  return {
    name: profile.name,
    brandName: profile.brandName ?? "",
    contactEmail: profile.contactEmail ?? "",
    phone: profile.phone ?? "",
    address: profile.address ?? "",
    invoicePrefix: profile.invoicePrefix,
  };
}

/**
 * Workspace settings form state: the shared schema validates on the client (UX only, C-004),
 * server field errors land on their fields with the first focused, and a failed request keeps
 * the entered values and raises the retryable server error (AC-WS-024).
 * @param options - the saved profile, the bound save action and the success callback
 * @returns the form, the server-error flag, the submitting flag and the submit handler
 */
export function useSettingsForm({ profile, action, onSaved }: SettingsFormOptions): SettingsForm {
  const [hasServerError, setHasServerError] = useState(false);
  const form = useForm<SettingsValues, unknown, SettingsValues>({
    resolver: zodResolver(updateWorkspaceProfileFieldsSchema),
    defaultValues: toValues(profile),
    shouldFocusError: true,
  });

  async function submit(values: SettingsValues): Promise<void> {
    setHasServerError(false);
    const failure = await action(values);
    if (!failure) {
      onSaved();
      return;
    }
    const failed = FIELDS.filter((field) => failure.fieldErrors[field]);
    for (const [index, field] of failed.entries()) {
      form.setError(
        field,
        { type: "server", message: failure.fieldErrors[field] },
        { shouldFocus: index === 0 },
      );
    }
  }

  function failRequest(): void {
    setHasServerError(true);
  }

  const handle = form.handleSubmit(submit);
  function onSubmit(event?: BaseSyntheticEvent): void {
    handle(event).catch(failRequest);
  }

  return { form, hasServerError, isSubmitting: form.formState.isSubmitting, onSubmit };
}
