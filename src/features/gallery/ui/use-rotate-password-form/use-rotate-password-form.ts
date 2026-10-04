"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useController, useForm } from "react-hook-form";

import { rotateGalleryPasswordSchema } from "@/features/gallery/application/schemas/rotate-gallery-password/rotate-gallery-password.schema";
import type {
  RotateGalleryPasswordInput,
  RotateGalleryPasswordValues,
} from "@/features/gallery/application/schemas/rotate-gallery-password/rotate-gallery-password.types";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import { useLifecycleRunner } from "../use-lifecycle-runner/use-lifecycle-runner";
import type { UseRotatePasswordFormInput } from "./use-rotate-password-form.types";

/** Owns the *Ganti password galeri* form: the proposal, *Buat ulang* and the save (AC-GAL-021). @param input - ids, actions and the close handler @returns the password field, error, handlers and flags */
export function useRotatePasswordForm(input: Readonly<UseRotatePasswordFormInput>) {
  const runner = useLifecycleRunner();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const form = useForm<RotateGalleryPasswordInput, unknown, RotateGalleryPasswordValues>({
    resolver: zodResolver(rotateGalleryPasswordSchema),
    defaultValues: { password: input.initialPassword },
  });
  const password = useController({ control: form.control, name: "password" });
  const submit = form.handleSubmit(async (values) => {
    const result = await runner.run(
      () => input.rotatePasswordAction(input.workspaceId, input.galleryId, values),
      {
        title: GALLERY_COPY.rotatedTitle,
        body: GALLERY_COPY.rotatedBody,
      },
    );
    if (result?.ok) input.onClose();
    else if (result && "fieldErrors" in result)
      form.setError("password", {
        type: "server",
        message: result.fieldErrors.password,
      });
  });
  const regenerate = async () => {
    setIsRegenerating(true);
    try {
      form.setValue("password", await input.proposeAction(input.workspaceId, input.projectId), {
        shouldValidate: true,
      });
    } finally {
      setIsRegenerating(false);
    }
  };
  return {
    field: password.field,
    error: password.fieldState.error?.message,
    submit,
    regenerate,
    isRegenerating,
    isPending: runner.isPending,
  };
}
