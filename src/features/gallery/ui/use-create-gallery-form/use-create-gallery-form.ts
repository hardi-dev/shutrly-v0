"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useController, useForm } from "react-hook-form";

import { createGallerySchema } from "@/features/gallery/application/schemas/create-gallery/create-gallery.schema";
import type {
  CreateGalleryInput,
  CreateGalleryValues,
} from "@/features/gallery/application/schemas/create-gallery/create-gallery.types";
import type { CreateGalleryResult } from "@/features/gallery/application/use-cases/gallery-results/gallery-results.types";
import { showToast } from "@/ui/patterns/toast/toast";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { UseCreateGalleryFormInput } from "./use-create-gallery-form.types";

type FieldPath = "password" | "expiry.date" | "expiry.days";
const FIELD_PATHS: readonly FieldPath[] = ["password", "expiry.date", "expiry.days"];

function isFieldPath(path: string): path is FieldPath {
  return FIELD_PATHS.some((candidate) => candidate === path);
}

function applyCreateResult(
  result: CreateGalleryResult,
  form: UseFormReturn<CreateGalleryInput, unknown, CreateGalleryValues>,
  onCreated: (galleryId: string) => void,
): void {
  if (result.ok) {
    showToast({
      tone: "success",
      title: GALLERY_COPY.createdTitle,
      body: GALLERY_COPY.createdBody,
    });
    onCreated(result.galleryId);
  } else if (result.code === "VALIDATION_FAILED") {
    for (const [path, key] of Object.entries(result.fieldErrors)) {
      if (isFieldPath(path)) form.setError(path, { type: "server", message: key });
    }
  } else showToast({ tone: "danger", title: GALLERY_COPY.refused[result.code] });
}

/** Owns the *Buat galeri* form: the proposed password, *Buat ulang*, the expiry and submit (AC-GAL-001, 002). @param input - ids, the first proposal and the actions @returns the form and handlers */
export function useCreateGalleryForm(input: Readonly<UseCreateGalleryFormInput>) {
  const form = useForm<CreateGalleryInput, unknown, CreateGalleryValues>({
    resolver: zodResolver(createGallerySchema),
    defaultValues: { password: input.initialPassword, expiry: { type: "NONE" } },
  });
  const [isPending, setIsPending] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const submit = form.handleSubmit(async (values) => {
    setIsPending(true);
    try {
      applyCreateResult(
        await input.createAction(input.workspaceId, input.projectId, values),
        form,
        input.onCreated,
      );
    } catch {
      showToast({
        tone: "danger",
        title: GALLERY_COPY.saveFailedTitle,
        body: GALLERY_COPY.saveFailedBody,
      });
    } finally {
      setIsPending(false);
    }
  });

  const regenerate = async () => {
    setIsRegenerating(true);
    try {
      const proposal = await input.proposeAction(input.workspaceId, input.projectId);
      form.setValue("password", proposal, { shouldValidate: true });
    } finally {
      setIsRegenerating(false);
    }
  };

  const password = useController({ control: form.control, name: "password" });
  const expiry = useController({ control: form.control, name: "expiry" });
  const errors = {
    password: password.fieldState.error?.message,
    date: form.getFieldState("expiry.date", form.formState).error?.message,
    days: form.getFieldState("expiry.days", form.formState).error?.message,
  };
  return { submit, regenerate, isPending, isRegenerating, password, expiry, errors };
}
