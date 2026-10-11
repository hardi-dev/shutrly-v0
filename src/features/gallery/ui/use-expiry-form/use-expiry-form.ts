"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useController, useForm } from "react-hook-form";

import { setGalleryExpirySchema } from "@/features/gallery/application/schemas/set-gallery-expiry/set-gallery-expiry.schema";
import type {
  SetGalleryExpiryInput,
  SetGalleryExpiryValues,
} from "@/features/gallery/application/schemas/set-gallery-expiry/set-gallery-expiry.types";

import { useLifecycleRunner } from "../use-lifecycle-runner/use-lifecycle-runner";
import { USE_EXPIRY_FORM_COPY_NAMESPACE } from "./use-expiry-form.copy";
import type { UseExpiryFormInput } from "./use-expiry-form.types";

/** Owns the *Kedaluwarsa galeri* form: the expiry choice and the save (AC-GAL-018…020). @param input - ids, the action and the close handler @returns the controlled expiry, the errors, the submit and the pending flag */
export function useExpiryForm(input: Readonly<UseExpiryFormInput>) {
  const t = useTranslations(USE_EXPIRY_FORM_COPY_NAMESPACE);
  const runner = useLifecycleRunner();
  const form = useForm<SetGalleryExpiryInput, unknown, SetGalleryExpiryValues>({
    resolver: zodResolver(setGalleryExpirySchema),
    defaultValues: { expiry: { type: "NONE" } },
  });
  const expiry = useController({ control: form.control, name: "expiry" });
  const submit = form.handleSubmit(async (values) => {
    const result = await runner.run(
      () => input.setExpiryAction(input.workspaceId, input.galleryId, values),
      {
        title: t("expirySavedTitle"),
      },
    );
    if (result?.ok) input.onClose();
    else if (result && "fieldErrors" in result)
      form.setError("expiry.date", { type: "server", message: "PAST_DATE" });
  });
  const errors = {
    date: form.getFieldState("expiry.date", form.formState).error?.message,
    days: form.getFieldState("expiry.days", form.formState).error?.message,
  };
  return { expiry: expiry.field, errors, submit, isPending: runner.isPending };
}
